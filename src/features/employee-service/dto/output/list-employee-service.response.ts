import { z } from 'zod';
import { createZodDto } from '@stlmpp/nestjs-zod';
import { createPaginatedResponseSchema } from '../../../../shared/model/response.model';

export const EmployeeServiceSchema = z.object({
  id: z.string(),
  employeeId: z.string(),
  employeeName: z.string(),
  catalogItemId: z.string(),
  catalogItemName: z.string(),
});

export const ListEmployeeServiceResponseSchema = createPaginatedResponseSchema(
  EmployeeServiceSchema,
);

export class ListEmployeeServiceResponseModel extends createZodDto(
  ListEmployeeServiceResponseSchema,
) {}
