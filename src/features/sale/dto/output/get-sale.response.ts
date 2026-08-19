import { z } from 'zod';
import { createZodDto } from '@stlmpp/nestjs-zod';
import { createResponseSchema } from '../../../../shared/model/response.model';
import { CreateSaleResSchema } from './create-sale.response';

export const GetSaleResSchema = CreateSaleResSchema;

export type GetSaleResDto = z.input<typeof GetSaleResSchema>;

export const GetSaleResponseSchema = createResponseSchema(
  z.object({
    sale: GetSaleResSchema,
  }),
);

export class GetSaleResponseModel extends createZodDto(GetSaleResponseSchema) {}
