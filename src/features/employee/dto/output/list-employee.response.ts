import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { createPaginatedResponseSchema } from '../../../../shared/model/response.model';

export const EmployeeSchema = z.object({
  id: z.string(),
  name: z.string().trim().min(1).max(1024),
  role: z.string().trim().min(1).max(256),
});

export const ListEmployeeResponseSchema =
  createPaginatedResponseSchema(EmployeeSchema);

export class ListEmployeeResponseModel extends createZodDto(
  ListEmployeeResponseSchema,
) {}
