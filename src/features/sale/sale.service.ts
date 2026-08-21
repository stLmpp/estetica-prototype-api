import { Injectable } from '@nestjs/common';
import { SaleRepository } from '../../database/main/repositories/sale.repository';
import { SaleReadService } from './sale-read.service';
import { CreateSaleUseCase } from './use-cases/create-sale.use-case';
import { AddSaleTransactionUseCase } from './use-cases/add-sale-transaction.use-case';
import { CreateSaleDto } from './dto/input/create-sale.request';
import { AddSaleTransactionDto } from './dto/input/add-sale-transaction.request';
import { UpdateSaleStatusDto } from './dto/input/update-sale-status.request';
import { FilterSaleDto } from './dto/input/list-sale.request';
import { SaleExceptions } from './sale-exceptions';
import { MainTransactional } from '../../database/main/main-database-connection';
import { SaleStatus } from '../../shared/domain/sale-status.enum';

@Injectable()
export class SaleService {
  constructor(
    private readonly saleRepository: SaleRepository,
    private readonly saleReadService: SaleReadService,
    private readonly createSaleUseCase: CreateSaleUseCase,
    private readonly addSaleTransactionUseCase: AddSaleTransactionUseCase,
  ) {}

  create(dto: CreateSaleDto) {
    return this.createSaleUseCase.execute(dto);
  }

  addTransaction(saleId: string, dto: AddSaleTransactionDto) {
    return this.addSaleTransactionUseCase.execute(saleId, dto);
  }

  @MainTransactional()
  async updateStatus(id: string, dto: UpdateSaleStatusDto) {
    const sale = await this.saleReadService.require(id);
    if (dto.status === sale.status) {
      return;
    }
    if (
      sale.status !== SaleStatus.PENDING ||
      dto.status !== SaleStatus.CANCELLED
    ) {
      throw SaleExceptions.saleInvalidStatusTransition([
        {
          field: 'status',
          issue: `cannot transition from '${sale.status}' to '${dto.status}'`,
        },
      ]);
    }
    await this.saleRepository.update(id, { status: dto.status });
  }

  @MainTransactional()
  async delete(id: string) {
    await this.saleReadService.require(id);
    await this.saleRepository.delete(id);
  }

  @MainTransactional()
  async listPaginated(dto: FilterSaleDto) {
    const { sales, count } = await this.saleRepository.findPaginated(dto);
    return {
      sales: sales.map((sale) => ({
        ...sale,
        appointmentId: sale.appointmentId ?? undefined,
      })),
      count,
    };
  }
}
