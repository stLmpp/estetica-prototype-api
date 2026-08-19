import { z } from 'zod';
import { createZodDto } from '@stlmpp/nestjs-zod';
import { createResponseSchema } from '../../../../shared/model/response.model';
import { CustomerAnamnesisModelSchema } from '../../model/customer-anamnesis.model';

export const FinalizeCustomerAnamnesisResponseSchema = createResponseSchema(
  z.object({
    customerAnamnesis: CustomerAnamnesisModelSchema,
  }),
);

export class FinalizeCustomerAnamnesisResponseModel extends createZodDto(
  FinalizeCustomerAnamnesisResponseSchema,
) {}
