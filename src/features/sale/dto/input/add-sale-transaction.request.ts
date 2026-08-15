import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { SaleTransactionInputSchema } from '../../model/sale.model';

export class AddSaleTransactionDto extends createZodDto(
  SaleTransactionInputSchema,
  { type: 'output' },
) {}

export const AddSaleTransactionRequestSchema = z.object({
  transaction: SaleTransactionInputSchema,
});

export class AddSaleTransactionRequest extends createZodDto(
  AddSaleTransactionRequestSchema,
  { type: 'output' },
) {}
