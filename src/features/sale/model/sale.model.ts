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

export const SaleTransactionInputSchema = z.object({
  type: z.enum(SaleTransactionType),
  paymentMethod: z.enum(PaymentMethod),
  amount: MonetaryAmountSchema,
  installmentCount: z.int().min(2).optional(),
  dueDate: DateParamSchema.optional(),
  receivedAt: DatetimeParamSchema.optional(),
  markFirstInstallmentAsReceived: z.boolean().default(false),
});

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
