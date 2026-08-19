import { z } from 'zod';
import { createZodDto } from '@stlmpp/nestjs-zod';
import { SaleStatus } from '../../../../shared/domain/sale-status.enum';
import { createResponseSchema } from '../../../../shared/model/response.model';
import {
  SaleItemModelSchema,
  SaleTransactionModelSchema,
} from '../../model/sale.model';

const MonetaryAmountSchema = z
  .string()
  .trim()
  .regex(/^\d{1,8}(\.\d{1,2})?$/);

export const CreateSaleResSchema = z.object({
  id: z.string(),
  status: z.enum(SaleStatus),
  totalAmount: MonetaryAmountSchema,
  customerId: z.string(),
  customerName: z.string(),
  employeeId: z.string(),
  employeeName: z.string(),
  appointmentId: z.string().optional(),
  items: z.array(SaleItemModelSchema),
  transactions: z.array(SaleTransactionModelSchema),
});

export type CreateSaleResDto = z.input<typeof CreateSaleResSchema>;

export const CreateSaleResponseSchema = createResponseSchema(
  z.object({
    sale: CreateSaleResSchema,
  }),
);

export class CreateSaleResponseModel extends createZodDto(
  CreateSaleResponseSchema,
) {}
