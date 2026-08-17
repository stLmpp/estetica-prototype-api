import { createZodDto } from 'nestjs-zod';
import { createPaginatedResponseSchema } from '../../../../shared/model/response.model';
import { CustomerAnamnesisModelSchema } from '../../model/customer-anamnesis.model';

export const ListCustomerAnamnesisResponseSchema =
  createPaginatedResponseSchema(CustomerAnamnesisModelSchema);

export class ListCustomerAnamnesisResponseModel extends createZodDto(
  ListCustomerAnamnesisResponseSchema,
) {}
