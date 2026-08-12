import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { RequestPaginatedSchema } from '../../../../shared/model/request.model';

export const FilterEmployeeSchema = RequestPaginatedSchema.extend({
  name: z.string().trim().min(1).max(1024).optional(),
  role: z.string().trim().min(1).max(256).optional(),
  catalogItemId: z.string().trim().min(1).optional(),
});

export class FilterEmployeeDto extends createZodDto(FilterEmployeeSchema, {
  type: 'output',
}) {}
