import { createZodDto } from '@stlmpp/nestjs-zod';
import { createPaginatedResponseSchema } from '../../../../shared/model/response.model';
import { AnamnesisFormModelSchema } from '../../model/anamnesis-form.model';

export const ListAnamnesisFormResponseSchema = createPaginatedResponseSchema(
  AnamnesisFormModelSchema,
);

export class ListAnamnesisFormResponseModel extends createZodDto(
  ListAnamnesisFormResponseSchema,
) {}
