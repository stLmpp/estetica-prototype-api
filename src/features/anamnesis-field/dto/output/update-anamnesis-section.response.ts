import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { createResponseSchema } from '../../../../shared/model/response.model';
import { AnamnesisSectionModelSchema } from '../../model/anamnesis-section.model';

export const UpdateAnamnesisSectionResponseSchema = createResponseSchema(
  z.object({
    anamnesisSection: AnamnesisSectionModelSchema,
  }),
);

export class UpdateAnamnesisSectionResponseModel extends createZodDto(
  UpdateAnamnesisSectionResponseSchema,
) {}
