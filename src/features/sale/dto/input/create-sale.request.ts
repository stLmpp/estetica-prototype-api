import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
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

export const CreateSaleSchema = z
  .object({
    customerId: z.string().trim().min(1),
    employeeId: z.string().trim().min(1),
    appointmentId: z.string().trim().min(1).optional(),
    items: z.array(CreateSaleItemSchema).optional(),
    transactions: z.array(SaleTransactionInputSchema).optional(),
  })
  .refine((data) => !!data.appointmentId || !!data.items?.length, {
    message: 'items are required when appointmentId is not provided',
    path: ['items'],
  });

export class CreateSaleDto extends createZodDto(CreateSaleSchema, {
  type: 'output',
}) {}

export const CreateSaleRequestSchema = z.object({
  sale: CreateSaleSchema,
});

export class CreateSaleRequest extends createZodDto(CreateSaleRequestSchema, {
  type: 'output',
}) {}
