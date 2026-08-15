import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { PaymentMethod } from '../../../../shared/domain/payment-method.enum';
import { SaleTransactionType } from '../../../../shared/domain/sale-transaction-type.enum';
import { DateParamSchema } from '../../../../shared/model/common.model';
import { SaleTransactionInputSchema } from '../../model/sale.model';

const MonetaryAmountSchema = z
  .string()
  .trim()
  .regex(/^\d{1,8}(\.\d{1,2})?$/);

export const CreateSaleItemSchema = z.object({
  catalogItemId: z.string().trim().min(1),
  quantity: z.int().positive().default(1),
  priceApplied: MonetaryAmountSchema.optional(),
});

export const CreateSaleInstallmentPlanSchema = z.object({
  paymentMethod: z.literal(PaymentMethod.CREDIT_CARD),
  amount: MonetaryAmountSchema,
  installmentCount: z.int().min(2),
  firstDueDate: DateParamSchema,
  markFirstInstallmentAsReceived: z.boolean().default(false),
});

export const CreateSaleSchema = z
  .object({
    customerId: z.string().trim().min(1),
    employeeId: z.string().trim().min(1),
    appointmentId: z.string().trim().min(1).optional(),
    items: z.array(CreateSaleItemSchema).optional(),
    transactions: z.array(SaleTransactionInputSchema).optional(),
    installmentPlan: CreateSaleInstallmentPlanSchema.optional(),
  })
  .refine((data) => !!data.appointmentId || !!data.items?.length, {
    message: 'items are required when appointmentId is not provided',
    path: ['items'],
  })
  .refine(
    (data) =>
      !data.transactions?.some(
        (transaction) => transaction.type === SaleTransactionType.REFUND,
      ),
    {
      message:
        'transactions cannot include a REFUND at sale creation — refunds are only allowed against an existing sale',
      path: ['transactions'],
    },
  );

export class CreateSaleDto extends createZodDto(CreateSaleSchema, {
  type: 'output',
}) {}

export const CreateSaleRequestSchema = z.object({
  sale: CreateSaleSchema,
});

export class CreateSaleRequest extends createZodDto(CreateSaleRequestSchema, {
  type: 'output',
}) {}
