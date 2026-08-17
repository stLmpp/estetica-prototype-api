import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { createResponseSchema } from '../../../../shared/model/response.model';
import { AnamnesisSectionModelSchema } from '../../model/anamnesis-section.model';

export const ListAnamnesisSectionResponseSchema = createResponseSchema(
  z.object({
    anamnesisSections: z.array(AnamnesisSectionModelSchema),
  }),
);

export class ListAnamnesisSectionResponseModel extends createZodDto(
  ListAnamnesisSectionResponseSchema,
) {}
