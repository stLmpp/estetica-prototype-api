import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { MaritalStatus } from '../../../../shared/domain/marital-status.enum';

export const UpdateCustomerSchema = z.object({
  name: z.string().trim().min(1).max(1024).optional(),
  birthDate: z
    .codec(z.iso.datetime(), z.date(), {
      encode: (val) => val.toISOString(),
      decode: (val) => new Date(val),
    })
    .optional(),
  address: z.string().trim().min(1).max(1024).optional(),
  zipCode: z
    .string()
    .trim()
    .regex(/^\d{8}$/)
    .optional(),
  neighborhood: z.string().trim().min(1).max(256).optional(),
  city: z.string().trim().min(1).max(256).optional(),
  state: z.string().trim().min(1).max(256).optional(),
  jobName: z.string().trim().min(1).max(256).optional(),
  maritalStatus: z.enum(MaritalStatus).optional(),
  email: z.email().trim().optional(),
});

export class UpdateCustomerDto extends createZodDto(UpdateCustomerSchema, {
  type: 'output',
}) {}

export const UpdateCustomerRequestSchema = z.object({
  customer: UpdateCustomerSchema,
});

export class UpdateCustomerRequest extends createZodDto(
  UpdateCustomerRequestSchema,
  { type: 'output' },
) {}
