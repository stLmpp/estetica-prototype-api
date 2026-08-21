import { Injectable } from '@nestjs/common';
import { SaleRepository } from '../../../database/main/repositories/sale.repository';
import { CustomerReadService } from '../../customer/customer-read.service';
import { EmployeeReadService } from '../../employee/employee-read.service';
import { CatalogItemReadService } from '../../catalog-item/catalog-item-read.service';
import { AppointmentReadService } from '../../appointment/appointment-read.service';
import { CreateSaleDto } from '../dto/input/create-sale.request';
import { CreateSaleResDto } from '../dto/output/create-sale.response';
import { SaleExceptions } from '../sale-exceptions';
import { coreExceptions } from '../../../core/core-exceptions';
import { MainTransactional } from '../../../database/main/main-database-connection';
import { AppointmentStatus } from '../../../shared/domain/appointment-staus.enum';
import {
  deriveStatus,
  expandTransactionEntry,
  mapItemEntityToModel,
  mapTransactionEntityToModel,
  multiplyMoney,
  sumMoney,
} from '../sale.util';

interface ResolvedSaleItem {
  catalogItemId: string;
  catalogItemName: string;
  quantity: number;
  priceApplied: string;
}

@Injectable()
export class CreateSaleUseCase {
  constructor(
    private readonly saleRepository: SaleRepository,
    private readonly customerReadService: CustomerReadService,
    private readonly employeeReadService: EmployeeReadService,
    private readonly catalogItemReadService: CatalogItemReadService,
    private readonly appointmentReadService: AppointmentReadService,
  ) {}

  @MainTransactional()
  async execute(dto: CreateSaleDto): Promise<CreateSaleResDto> {
    const [customer, employee, appointment] = await Promise.all([
      this.customerReadService.requireWithPerson(dto.customerId),
      this.employeeReadService.requireWithPerson(dto.employeeId),
      dto.appointmentId
        ? this.appointmentReadService.requireWithItems(dto.appointmentId)
        : undefined,
    ]);

    if (appointment && appointment.status !== AppointmentStatus.COMPLETED) {
      throw SaleExceptions.saleAppointmentNotCompleted([
        {
          field: 'appointmentId',
          issue: `appointment status is '${appointment.status}', expected '${AppointmentStatus.COMPLETED}'`,
        },
      ]);
    }

    const items = await this.resolveItems(dto.items, appointment);
    const totalAmount = sumMoney(
      items.map((item) => multiplyMoney(item.priceApplied, item.quantity)),
    );

    const transactionsInput = (dto.transactions ?? []).flatMap((entry) =>
      expandTransactionEntry(entry, { allowRefund: false }),
    );
    const status = deriveStatus(transactionsInput, totalAmount);

    const sale = await this.saleRepository.insert({
      customerId: dto.customerId,
      employeeId: dto.employeeId,
      appointmentId: dto.appointmentId,
      status,
      totalAmount,
    });

    const catalogItemNameById = new Map(
      items.map((item) => [item.catalogItemId, item.catalogItemName]),
    );
    const [insertedItems, insertedTransactions] = await Promise.all([
      this.saleRepository.insertItems(
        sale.id,
        items.map((item) => ({
          catalogItemId: item.catalogItemId,
          quantity: item.quantity,
          priceApplied: item.priceApplied,
        })),
      ),
      this.saleRepository.insertTransactions(sale.id, transactionsInput),
    ]);

    return {
      id: sale.id,
      status: sale.status,
      totalAmount: sale.totalAmount,
      customerId: customer.id,
      customerName: customer.person.name,
      employeeId: employee.id,
      employeeName: employee.person.name,
      appointmentId: sale.appointmentId ?? undefined,
      items: insertedItems.map((entity) =>
        mapItemEntityToModel(
          entity,
          catalogItemNameById.get(entity.catalogItemId)!,
        ),
      ),
      transactions: insertedTransactions.map((entity) =>
        mapTransactionEntityToModel(entity),
      ),
    };
  }

  private async resolveItems(
    dtoItems: CreateSaleDto['items'],
    appointment:
      | Awaited<ReturnType<AppointmentReadService['requireWithItems']>>
      | undefined,
  ): Promise<ResolvedSaleItem[]> {
    const baseItems = dtoItems?.length
      ? dtoItems
      : appointment
        ? appointment.appointmentItems.map((item) => ({
            catalogItemId: item.catalogItemId,
            quantity: item.quantity,
            priceApplied: item.priceApplied,
          }))
        : undefined;

    if (!baseItems || !baseItems.length) {
      throw coreExceptions.invalidRequest([
        { field: 'items', issue: 'items are required' },
      ]);
    }

    const catalogItems = await this.catalogItemReadService.requireMany(
      baseItems.map((item) => item.catalogItemId),
    );
    const catalogItemById = new Map(
      catalogItems.map((catalogItem) => [catalogItem.id, catalogItem]),
    );

    return baseItems.map((item) => {
      const catalogItem = catalogItemById.get(item.catalogItemId)!;
      const priceApplied = item.priceApplied ?? catalogItem.defaultPrice;
      if (!priceApplied) {
        throw coreExceptions.invalidRequest([
          {
            field: 'priceApplied',
            issue: `catalog item '${item.catalogItemId}' has no default price; priceApplied must be provided`,
          },
        ]);
      }
      return {
        catalogItemId: item.catalogItemId,
        catalogItemName: catalogItem.name,
        quantity: item.quantity,
        priceApplied,
      };
    });
  }
}
