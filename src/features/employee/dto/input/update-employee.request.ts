import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { MaritalStatus } from '../../../../shared/domain/marital-status.enum';
import {
  DateParamSchema,
  ZipCodeSchema,
} from '../../../../shared/model/common.model';

export const UpdateEmployeeSchema = z
  .object({
    name: z.string().trim().min(1).max(1024).optional(),
    role: z.string().trim().min(1).max(256).optional(),
    birthDate: DateParamSchema.optional(),
    address: z.string().trim().min(1).max(1024).optional(),
    zipCode: ZipCodeSchema.optional(),
    neighborhood: z.string().trim().min(1).max(256).optional(),
    city: z.string().trim().min(1).max(256).optional(),
    state: z.string().trim().min(1).max(256).optional(),
    maritalStatus: z.enum(MaritalStatus).optional(),
    email: z.email().trim().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

export class UpdateEmployeeDto extends createZodDto(UpdateEmployeeSchema, {
  type: 'output',
}) {}

export const UpdateEmployeeRequestSchema = z.object({
  employee: UpdateEmployeeSchema,
});

export class UpdateEmployeeRequest extends createZodDto(
  UpdateEmployeeRequestSchema,
  { type: 'output' },
) {}
