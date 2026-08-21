import { Injectable } from '@nestjs/common';
import { CustomerFollowupRepository } from '../../database/main/repositories/customer-followup.repository';
import { CustomerReadService } from '../customer/customer-read.service';
import { AppointmentReadService } from '../appointment/appointment-read.service';
import { SaleReadService } from '../sale/sale-read.service';
import { CatalogItemReadService } from '../catalog-item/catalog-item-read.service';
import { MainTransactional } from '../../database/main/main-database-connection';
import { CustomerFollowupExceptions } from './customer-followup-exceptions';
import { CustomerFollowupReadService } from './customer-followup-read.service';
import { type CreateCustomerFollowupDto } from './dto/input/create-customer-followup.request';
import { type FilterCustomerFollowupDto } from './dto/input/list-customer-followup.request';
import { type UpdateCustomerFollowupDto } from './dto/input/update-customer-followup.request';
import { type CustomerFollowupResDto } from './dto/output/create-customer-followup.response';
import { type CustomerFollowupItemInput } from './model/customer-followup.model';

@Injectable()
export class CustomerFollowupService {
  constructor(
    private readonly customerFollowupRepository: CustomerFollowupRepository,
    private readonly customerReadService: CustomerReadService,
    private readonly appointmentReadService: AppointmentReadService,
    private readonly saleReadService: SaleReadService,
    private readonly catalogItemReadService: CatalogItemReadService,
    private readonly customerFollowupReadService: CustomerFollowupReadService,
  ) {}

  @MainTransactional()
  async create(
    dto: CreateCustomerFollowupDto,
  ): Promise<CustomerFollowupResDto> {
    await this.customerReadService.require(dto.customerId);
    await this.assertLinksValid(dto.customerId, dto.appointmentId, dto.saleId);

    const resolvedItems = await this.resolveItems(dto.items);

    const customerFollowup = await this.customerFollowupRepository.insert({
      customerId: dto.customerId,
      text: dto.text,
      date: dto.date ?? new Date(),
      appointmentId: dto.appointmentId,
      saleId: dto.saleId,
    });

    const insertedItems = await this.customerFollowupRepository.insertItems(
      customerFollowup.id,
      resolvedItems.map((item) => ({
        description: item.description,
        catalogItemId: item.catalogItemId,
        quantity: item.quantity,
        priceApplied: item.priceApplied,
      })),
    );
    const catalogItemNameById = new Map(
      resolvedItems
        .filter((item) => item.catalogItemId)
        .map((item) => [item.catalogItemId!, item.catalogItemName]),
    );

    return {
      id: customerFollowup.id,
      customerId: customerFollowup.customerId,
      text: customerFollowup.text,
      date: customerFollowup.date,
      appointmentId: customerFollowup.appointmentId ?? undefined,
      saleId: customerFollowup.saleId ?? undefined,
      items: insertedItems.map((item) => ({
        id: item.id,
        description: item.description,
        catalogItemId: item.catalogItemId ?? undefined,
        catalogItemName: item.catalogItemId
          ? catalogItemNameById.get(item.catalogItemId)
          : undefined,
        quantity: item.quantity,
        priceApplied: item.priceApplied,
      })),
    };
  }

  @MainTransactional()
  async listPaginated(dto: FilterCustomerFollowupDto) {
    const { customerFollowups, count } =
      await this.customerFollowupRepository.findPaginated(dto.customerId, dto);
    return {
      items: customerFollowups.map((record) => ({
        id: record.id,
        customerId: record.customerId,
        text: record.text,
        date: record.date,
        appointmentId: record.appointmentId ?? undefined,
        saleId: record.saleId ?? undefined,
      })),
      count,
    };
  }

  @MainTransactional()
  async update(id: string, dto: UpdateCustomerFollowupDto): Promise<void> {
    const record = await this.customerFollowupReadService.require(id);

    const resolvedAppointmentId =
      dto.appointmentId !== undefined
        ? (dto.appointmentId ?? undefined)
        : (record.appointmentId ?? undefined);
    const resolvedSaleId =
      dto.saleId !== undefined
        ? (dto.saleId ?? undefined)
        : (record.saleId ?? undefined);
    if (dto.appointmentId !== undefined || dto.saleId !== undefined) {
      await this.assertLinksValid(
        record.customerId,
        resolvedAppointmentId,
        resolvedSaleId,
      );
    }

    const patch: {
      text?: string;
      date?: Date;
      appointmentId?: string | null;
      saleId?: string | null;
    } = {};
    if (dto.text !== undefined) {
      patch.text = dto.text;
    }
    if (dto.date !== undefined) {
      patch.date = dto.date;
    }
    if (dto.appointmentId !== undefined) {
      patch.appointmentId = dto.appointmentId;
    }
    if (dto.saleId !== undefined) {
      patch.saleId = dto.saleId;
    }
    await this.customerFollowupRepository.update(id, patch);

    if (dto.items !== undefined) {
      const resolvedItems = await this.resolveItems(dto.items);
      await this.customerFollowupRepository.deleteAllItemsByFollowupId(id);
      await this.customerFollowupRepository.insertItems(
        id,
        resolvedItems.map((item) => ({
          description: item.description,
          catalogItemId: item.catalogItemId,
          quantity: item.quantity,
          priceApplied: item.priceApplied,
        })),
      );
    }
  }

  @MainTransactional()
  async delete(id: string): Promise<void> {
    await this.customerFollowupReadService.require(id);
    await this.customerFollowupRepository.delete(id);
  }

  private async assertLinksValid(
    customerId: string,
    appointmentId: string | undefined,
    saleId: string | undefined,
  ) {
    const [appointment, sale] = await Promise.all([
      appointmentId
        ? this.appointmentReadService.require(appointmentId)
        : undefined,
      saleId ? this.saleReadService.require(saleId) : undefined,
    ]);

    if (appointment && appointment.customerId !== customerId) {
      throw CustomerFollowupExceptions.customerFollowupAppointmentMismatch([
        {
          field: 'appointmentId',
          issue: `appointment '${appointmentId}' does not belong to customer '${customerId}'`,
        },
      ]);
    }

    if (sale && sale.customerId !== customerId) {
      throw CustomerFollowupExceptions.customerFollowupSaleMismatch([
        {
          field: 'saleId',
          issue: `sale '${saleId}' does not belong to customer '${customerId}'`,
        },
      ]);
    }

    if (appointment && sale && sale.appointmentId !== appointment.id) {
      throw CustomerFollowupExceptions.customerFollowupSaleAppointmentMismatch([
        {
          field: 'saleId',
          issue: `sale '${saleId}' is not linked to appointment '${appointmentId}'`,
        },
      ]);
    }
  }

  private async resolveItems(items: CustomerFollowupItemInput[] | undefined) {
    if (!items?.length) {
      return [];
    }
    const catalogItemIds = [
      ...new Set(
        items
          .map((item) => item.catalogItemId)
          .filter((id): id is string => !!id),
      ),
    ];
    const catalogItems = catalogItemIds.length
      ? await this.catalogItemReadService.requireMany(catalogItemIds)
      : [];
    const catalogItemNameById = new Map(
      catalogItems.map((catalogItem) => [catalogItem.id, catalogItem.name]),
    );
    return items.map((item) => ({
      description: item.description,
      catalogItemId: item.catalogItemId,
      catalogItemName: item.catalogItemId
        ? catalogItemNameById.get(item.catalogItemId)
        : undefined,
      quantity: item.quantity,
      priceApplied: item.priceApplied,
    }));
  }
}
