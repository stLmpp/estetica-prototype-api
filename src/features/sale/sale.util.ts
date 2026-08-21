import Big from 'big.js';
import dayjs from 'dayjs';
import { type InferSelectModel } from 'drizzle-orm';
import { type mainEntities } from '../../database/main/main-entities';
import { type AddSaleTransactionDto } from './dto/input/add-sale-transaction.request';
import {
  type SaleItemModel,
  type SaleTransactionModel,
} from './model/sale.model';
import { SaleExceptions } from './sale-exceptions';
import { coreExceptions } from '../../core/core-exceptions';
import { SaleStatus } from '../../shared/domain/sale-status.enum';
import { SaleTransactionType } from '../../shared/domain/sale-transaction-type.enum';
import { PaymentMethod } from '../../shared/domain/payment-method.enum';

export interface TransactionForStatus {
  type: SaleTransactionType;
  amount: string;
  receivedAt?: Date | null;
}

export function sumMoney(amounts: string[]): string {
  return amounts.reduce((sum, amount) => sum.plus(amount), Big(0)).toFixed(2);
}

export function multiplyMoney(amount: string, quantity: number): string {
  return Big(amount).times(quantity).toFixed(2);
}

export function deriveStatus(
  transactions: TransactionForStatus[],
  totalAmount: string,
): SaleStatus {
  if (
    transactions.some(
      (transaction) => transaction.type === SaleTransactionType.REFUND,
    )
  ) {
    return SaleStatus.REFUNDED;
  }
  const confirmedPaid = sumMoney(
    transactions
      .filter(
        (transaction) =>
          transaction.type === SaleTransactionType.PAYMENT &&
          transaction.receivedAt,
      )
      .map((transaction) => transaction.amount),
  );
  if (Big(confirmedPaid).gte(totalAmount)) {
    return SaleStatus.PAID;
  }
  return SaleStatus.PENDING;
}

export function assertRefundsDoNotExceedPayments(
  transactions: TransactionForStatus[],
) {
  const confirmedPaid = sumMoney(
    transactions
      .filter(
        (transaction) =>
          transaction.type === SaleTransactionType.PAYMENT &&
          transaction.receivedAt,
      )
      .map((transaction) => transaction.amount),
  );
  const totalRefunded = sumMoney(
    transactions
      .filter((transaction) => transaction.type === SaleTransactionType.REFUND)
      .map((transaction) => transaction.amount),
  );
  if (Big(totalRefunded).gt(confirmedPaid)) {
    throw SaleExceptions.saleRefundExceedsPaidAmount([
      {
        field: 'amount',
        issue: `total refunded '${totalRefunded}' would exceed the confirmed paid amount '${confirmedPaid}'`,
      },
    ]);
  }
}

export function generateInstallmentTransactions(plan: {
  paymentMethod: PaymentMethod;
  amount: string;
  installmentCount: number;
  firstDueDate: Date;
  markFirstInstallmentAsReceived: boolean;
}) {
  const baseAmount = new Big(plan.amount)
    .div(plan.installmentCount)
    .round(2, Big.roundDown);
  const lastAmount = new Big(plan.amount).minus(
    baseAmount.times(plan.installmentCount - 1),
  );

  return Array.from({ length: plan.installmentCount }, (_, index) => {
    const installmentNumber = index + 1;
    const isLastInstallment = installmentNumber === plan.installmentCount;
    return {
      type: SaleTransactionType.PAYMENT,
      paymentMethod: plan.paymentMethod,
      amount: (isLastInstallment ? lastAmount : baseAmount).toFixed(2),
      installmentNumber,
      installmentCount: plan.installmentCount,
      dueDate: dayjs(plan.firstDueDate).add(index, 'month').toDate(),
      receivedAt:
        installmentNumber === 1 && plan.markFirstInstallmentAsReceived
          ? new Date()
          : undefined,
    };
  });
}

export function expandTransactionEntry(
  entry: AddSaleTransactionDto,
  options: { allowRefund: boolean },
) {
  if (entry.installmentCount) {
    if (
      entry.paymentMethod !== PaymentMethod.CREDIT_CARD ||
      entry.type !== SaleTransactionType.PAYMENT
    ) {
      throw SaleExceptions.saleInstallmentRequiresCreditCardPayment([
        {
          field: 'paymentMethod',
          issue: `installment plans require type '${SaleTransactionType.PAYMENT}' and paymentMethod '${PaymentMethod.CREDIT_CARD}'`,
        },
      ]);
    }
    if (!entry.dueDate) {
      throw coreExceptions.invalidRequest([
        {
          field: 'dueDate',
          issue:
            'dueDate (first installment due date) is required for an installment plan',
        },
      ]);
    }
    return generateInstallmentTransactions({
      paymentMethod: entry.paymentMethod,
      amount: entry.amount,
      installmentCount: entry.installmentCount,
      firstDueDate: entry.dueDate,
      markFirstInstallmentAsReceived: entry.markFirstInstallmentAsReceived,
    });
  }

  if (!options.allowRefund && entry.type === SaleTransactionType.REFUND) {
    throw SaleExceptions.saleRefundNotAllowedAtCreation([
      {
        field: 'type',
        issue: `transaction type '${entry.type}' is not allowed at sale creation`,
      },
    ]);
  }

  return [
    {
      type: entry.type,
      paymentMethod: entry.paymentMethod,
      amount: entry.amount,
      dueDate: entry.dueDate,
      receivedAt: entry.receivedAt,
    },
  ];
}

export function mapItemEntityToModel(
  entity: InferSelectModel<typeof mainEntities.saleItem>,
  catalogItemName: string,
): SaleItemModel {
  return {
    id: entity.id,
    catalogItemId: entity.catalogItemId,
    catalogItemName,
    quantity: entity.quantity,
    priceApplied: entity.priceApplied,
  };
}

export function mapTransactionEntityToModel(
  entity: InferSelectModel<typeof mainEntities.saleTransaction>,
): SaleTransactionModel {
  return {
    id: entity.id,
    type: entity.type,
    paymentMethod: entity.paymentMethod,
    amount: entity.amount,
    installmentNumber: entity.installmentNumber ?? undefined,
    installmentCount: entity.installmentCount ?? undefined,
    dueDate: entity.dueDate ?? undefined,
    receivedAt: entity.receivedAt ?? undefined,
  };
}
