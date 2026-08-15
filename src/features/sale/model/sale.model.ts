import { z } from 'zod';
import { PaymentMethod } from '../../../shared/domain/payment-method.enum';
import { SaleTransactionType } from '../../../shared/domain/sale-transaction-type.enum';
import {
  DateParamSchema,
  DateSchema,
  DatetimeParamSchema,
  DatetimeSchema,
} from '../../../shared/model/common.model';

const MonetaryAmountSchema = z
  .string()
  .trim()
  .regex(/^\d{1,8}(\.\d{1,2})?$/);

/**
 * Shared between `create-sale.request.ts` (transactions[]) and
 * `add-sale-transaction.request.ts` — same shape, same installment rules.
 */
export const SaleTransactionInputSchema = z
  .object({
    type: z.enum(SaleTransactionType),
    paymentMethod: z.enum(PaymentMethod),
    amount: MonetaryAmountSchema,
    installmentNumber: z.int().positive().optional(),
    installmentCount: z.int().positive().optional(),
    dueDate: DateParamSchema.optional(),
    receivedAt: DatetimeParamSchema.optional(),
  })
  .refine(
    (data) =>
      (data.installmentNumber === undefined) ===
      (data.installmentCount === undefined),
    {
      message: 'installmentNumber and installmentCount must be set together',
      path: ['installmentNumber'],
    },
  )
  .refine(
    (data) =>
      data.installmentNumber === undefined ||
      data.installmentNumber <= data.installmentCount!,
    {
      message: 'installmentNumber cannot exceed installmentCount',
      path: ['installmentNumber'],
    },
  );

export const SaleItemModelSchema = z.object({
  id: z.string(),
  catalogItemId: z.string(),
  catalogItemName: z.string(),
  quantity: z.int().positive(),
  priceApplied: MonetaryAmountSchema,
});

export type SaleItemModel = z.input<typeof SaleItemModelSchema>;

export const SaleTransactionModelSchema = z.object({
  id: z.string(),
  type: z.enum(SaleTransactionType),
  paymentMethod: z.enum(PaymentMethod),
  amount: MonetaryAmountSchema,
  installmentNumber: z.int().positive().optional(),
  installmentCount: z.int().positive().optional(),
  dueDate: DateSchema.optional(),
  receivedAt: DatetimeSchema.optional(),
});

export type SaleTransactionModel = z.input<typeof SaleTransactionModelSchema>;
