import { z } from 'zod';
import { createZodDto } from '@stlmpp/nestjs-zod';
import { createResponseSchema } from '../../../../shared/model/response.model';
import { AnamnesisFieldModelSchema } from '../../model/anamnesis-field.model';

export const ListAnamnesisFieldResponseSchema = createResponseSchema(
  z.object({
    anamnesisFields: z.array(AnamnesisFieldModelSchema),
  }),
);

export class ListAnamnesisFieldResponseModel extends createZodDto(
  ListAnamnesisFieldResponseSchema,
) {}
