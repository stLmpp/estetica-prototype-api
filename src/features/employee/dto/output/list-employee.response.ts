import { z } from 'zod';
import { createZodDto } from '@stlmpp/nestjs-zod';
import { createPaginatedResponseSchema } from '../../../../shared/model/response.model';
import { WeeklyWorkingHoursSchema } from '../../../../shared/model/working-hours.model';

export const EmployeeSchema = z.object({
  id: z.string(),
  name: z.string().trim().min(1).max(1024),
  role: z.string().trim().min(1).max(256),
  workingHours: WeeklyWorkingHoursSchema.nullable().optional(),
});

export const ListEmployeeResponseSchema =
  createPaginatedResponseSchema(EmployeeSchema);

export class ListEmployeeResponseModel extends createZodDto(
  ListEmployeeResponseSchema,
) {}
