import { Injectable } from '@nestjs/common';
import { SaleRepository } from '../../database/main/repositories/sale.repository';
import { MainTransactional } from '../../database/main/main-database-connection';
import { GetSaleResDto } from './dto/output/get-sale.response';
import { SaleExceptions } from './sale-exceptions';
import { mapItemEntityToModel, mapTransactionEntityToModel } from './sale.util';

@Injectable()
export class SaleReadService {
  constructor(private readonly saleRepository: SaleRepository) {}

  @MainTransactional()
  findByAppointmentId(appointmentId: string) {
    return this.saleRepository.findFirstByAppointmentId(appointmentId);
  }

  @MainTransactional()
  async findAppointmentIdToSaleIdMap(
    appointmentIds: string[],
  ): Promise<Map<string, string>> {
    const sales =
      await this.saleRepository.findByAppointmentIds(appointmentIds);
    return new Map(
      sales.map((sale) => [sale.appointmentId!, sale.id] as const),
    );
  }

  @MainTransactional()
  async require(id: string) {
    const sale = await this.saleRepository.findFirstById(id);
    if (!sale) {
      throw SaleExceptions.saleNotFound([
        { field: 'saleId', issue: `not found with value '${id}'` },
      ]);
    }
    return sale;
  }

  @MainTransactional()
  async requireWithDetails(id: string): Promise<GetSaleResDto> {
    const sale = await this.saleRepository.findFirstByIdWithDetails(id);
    if (!sale) {
      throw SaleExceptions.saleNotFound([
        { field: 'saleId', issue: `not found with value '${id}'` },
      ]);
    }
    return {
      id: sale.id,
      status: sale.status,
      totalAmount: sale.totalAmount,
      customerId: sale.customerId,
      customerName: sale.customer.person.name,
      employeeId: sale.employeeId,
      employeeName: sale.employee.person.name,
      appointmentId: sale.appointmentId ?? undefined,
      items: sale.saleItems.map((item) =>
        mapItemEntityToModel(item, item.catalogItem.name),
      ),
      transactions: sale.saleTransactions.map((transaction) =>
        mapTransactionEntityToModel(transaction),
      ),
    };
  }
}
