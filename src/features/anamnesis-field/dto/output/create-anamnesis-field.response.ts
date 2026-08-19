import { z } from 'zod';
import { createZodDto } from '@stlmpp/nestjs-zod';
import { createResponseSchema } from '../../../../shared/model/response.model';
import { AnamnesisFieldModelSchema } from '../../model/anamnesis-field.model';

export const CreateAnamnesisFieldResponseSchema = createResponseSchema(
  z.object({
    anamnesisField: AnamnesisFieldModelSchema,
  }),
);

export class CreateAnamnesisFieldResponseModel extends createZodDto(
  CreateAnamnesisFieldResponseSchema,
) {}
