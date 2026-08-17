import { createZodDto } from 'nestjs-zod';
import { createPaginatedResponseSchema } from '../../../../shared/model/response.model';
import { AnamnesisFieldModelSchema } from '../../model/anamnesis-field.model';

export const ListAnamnesisFieldResponseSchema = createPaginatedResponseSchema(
  AnamnesisFieldModelSchema,
);

export class ListAnamnesisFieldResponseModel extends createZodDto(
  ListAnamnesisFieldResponseSchema,
) {}
