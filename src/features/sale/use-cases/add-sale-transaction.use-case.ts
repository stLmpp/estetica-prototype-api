import { Injectable } from '@nestjs/common';
import { SaleRepository } from '../../../database/main/repositories/sale.repository';
import { SaleReadService } from '../sale-read.service';
import { AddSaleTransactionDto } from '../dto/input/add-sale-transaction.request';
import { AddSaleTransactionResDto } from '../dto/output/add-sale-transaction.response';
import { SaleExceptions } from '../sale-exceptions';
import { MainTransactional } from '../../../database/main/main-database-connection';
import { SaleStatus } from '../../../shared/domain/sale-status.enum';
import {
  assertRefundsDoNotExceedPayments,
  deriveStatus,
  expandTransactionEntry,
  mapTransactionEntityToModel,
} from '../sale.util';

@Injectable()
export class AddSaleTransactionUseCase {
  constructor(
    private readonly saleRepository: SaleRepository,
    private readonly saleReadService: SaleReadService,
  ) {}

  @MainTransactional()
  async execute(
    saleId: string,
    dto: AddSaleTransactionDto,
  ): Promise<AddSaleTransactionResDto> {
    const sale = await this.saleReadService.require(saleId);
    if (sale.status === SaleStatus.CANCELLED) {
      throw SaleExceptions.saleTerminalStatus([
        {
          field: 'status',
          issue: `cannot add a transaction to a sale with status '${sale.status}'`,
        },
      ]);
    }

    const newTransactionsInput = expandTransactionEntry(dto, {
      allowRefund: true,
    });
    const existingTransactions =
      await this.saleRepository.findTransactionsBySaleId(saleId);
    assertRefundsDoNotExceedPayments([
      ...existingTransactions,
      ...newTransactionsInput,
    ]);

    const insertedTransactions = await this.saleRepository.insertTransactions(
      saleId,
      newTransactionsInput,
    );
    const allTransactions = [...existingTransactions, ...insertedTransactions];
    const status = deriveStatus(allTransactions, sale.totalAmount);
    if (status !== sale.status) {
      await this.saleRepository.update(saleId, { status });
    }

    return {
      transactions: insertedTransactions.map((entity) =>
        mapTransactionEntityToModel(entity),
      ),
      saleStatus: status,
    };
  }
}
