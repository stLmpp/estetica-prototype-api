import { Injectable } from '@nestjs/common';
import { SaleRepository } from '../../database/main/repositories/sale.repository';
import { MainTransactional } from '../../database/main/main-database-connection';

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
}
