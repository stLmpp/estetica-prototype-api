import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { createPaginatedResponseSchema } from '../../../../shared/model/response.model';

export const CustomerSchema = z.object({
  id: z.number(),
  name: z.string().trim().min(1).max(1024),
});

export const ListCustomerResponseSchema =
  createPaginatedResponseSchema(CustomerSchema);

export class ListCustomerResponseModel extends createZodDto(
  ListCustomerResponseSchema,
) {}
