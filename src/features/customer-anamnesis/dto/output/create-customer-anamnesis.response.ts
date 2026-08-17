import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { createResponseSchema } from '../../../../shared/model/response.model';
import { CustomerAnamnesisModelSchema } from '../../model/customer-anamnesis.model';

export const CreateCustomerAnamnesisResponseSchema = createResponseSchema(
  z.object({
    customerAnamnesis: CustomerAnamnesisModelSchema,
  }),
);

export class CreateCustomerAnamnesisResponseModel extends createZodDto(
  CreateCustomerAnamnesisResponseSchema,
) {}
