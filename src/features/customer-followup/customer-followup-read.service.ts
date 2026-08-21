import { Injectable } from '@nestjs/common';
import { CustomerFollowupRepository } from '../../database/main/repositories/customer-followup.repository';
import { MainTransactional } from '../../database/main/main-database-connection';
import { CustomerFollowupExceptions } from './customer-followup-exceptions';
import { type CustomerFollowupResDto } from './dto/output/create-customer-followup.response';

@Injectable()
export class CustomerFollowupReadService {
  constructor(
    private readonly customerFollowupRepository: CustomerFollowupRepository,
  ) {}

  @MainTransactional()
  async require(id: string) {
    const record = await this.customerFollowupRepository.findFirstById(id);
    if (!record) {
      throw CustomerFollowupExceptions.customerFollowupNotFound([
        { field: 'customerFollowupId', issue: `not found with value '${id}'` },
      ]);
    }
    return record;
  }

  @MainTransactional()
  async requireWithItems(id: string): Promise<CustomerFollowupResDto> {
    const record =
      await this.customerFollowupRepository.findFirstByIdWithItems(id);
    if (!record) {
      throw CustomerFollowupExceptions.customerFollowupNotFound([
        { field: 'customerFollowupId', issue: `not found with value '${id}'` },
      ]);
    }
    return {
      id: record.id,
      customerId: record.customerId,
      text: record.text,
      date: record.date,
      appointmentId: record.appointmentId ?? undefined,
      saleId: record.saleId ?? undefined,
      items: record.followupItems.map((item) => ({
        id: item.id,
        description: item.description,
        catalogItemId: item.catalogItemId ?? undefined,
        catalogItemName: item.catalogItem?.name,
        quantity: item.quantity,
        priceApplied: item.priceApplied,
      })),
    };
  }
}
