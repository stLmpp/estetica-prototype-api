import { z } from 'zod';
import { createZodDto } from '@stlmpp/nestjs-zod';

export const CreateEmployeeServiceSchema = z.object({
  employeeId: z.string().trim().min(1),
  catalogItemId: z.string().trim().min(1),
});

export class CreateEmployeeServiceDto extends createZodDto(
  CreateEmployeeServiceSchema,
  { type: 'output' },
) {}

export const EmployeeServiceCreateSchema = z.object({
  employeeService: CreateEmployeeServiceSchema,
});

export class EmployeeServiceCreateRequest extends createZodDto(
  EmployeeServiceCreateSchema,
  { type: 'output' },
) {}
