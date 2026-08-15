import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { SaleStatus } from '../../../../shared/domain/sale-status.enum';
import { createResponseSchema } from '../../../../shared/model/response.model';
import { SaleTransactionModelSchema } from '../../model/sale.model';

export const AddSaleTransactionResSchema = z.object({
  transactions: z.array(SaleTransactionModelSchema),
  saleStatus: z.enum(SaleStatus),
});

export type AddSaleTransactionResDto = z.input<
  typeof AddSaleTransactionResSchema
>;

export const AddSaleTransactionResponseSchema = createResponseSchema(
  AddSaleTransactionResSchema,
);

export class AddSaleTransactionResponseModel extends createZodDto(
  AddSaleTransactionResponseSchema,
) {}
