import { z } from 'zod';
import { createZodDto } from '@stlmpp/nestjs-zod';
import { RequestPaginatedSchema } from '../../../../shared/model/request.model';

export const FilterEmployeeServiceSchema = RequestPaginatedSchema.extend({
  employeeId: z.string().trim().min(1).optional(),
  catalogItemId: z.string().trim().min(1).optional(),
});

export class FilterEmployeeServiceDto extends createZodDto(
  FilterEmployeeServiceSchema,
  { type: 'output' },
) {}
