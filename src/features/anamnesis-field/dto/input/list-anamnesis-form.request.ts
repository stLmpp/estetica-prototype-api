import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { RequestPaginatedSchema } from '../../../../shared/model/request.model';
import { BooleanParamSchema } from '../../../../shared/model/common.model';

export const FilterAnamnesisFormSchema = RequestPaginatedSchema.extend({
  name: z.string().trim().min(1).max(256).optional(),
  active: BooleanParamSchema.optional(),
});

export class FilterAnamnesisFormDto extends createZodDto(
  FilterAnamnesisFormSchema,
  { type: 'output' },
) {}
