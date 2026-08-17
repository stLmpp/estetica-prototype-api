import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { RequestPaginatedSchema } from '../../../../shared/model/request.model';
import { BooleanParamSchema } from '../../../../shared/model/common.model';

export const FilterAnamnesisFieldSchema = RequestPaginatedSchema.extend({
  anamnesisFormId: z.string(),
  anamnesisSectionId: z.string().optional(),
  active: BooleanParamSchema.optional(),
});

export class FilterAnamnesisFieldDto extends createZodDto(
  FilterAnamnesisFieldSchema,
  { type: 'output' },
) {}
