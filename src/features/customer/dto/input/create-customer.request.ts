import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { PhoneType } from '../../../../shared/domain/phone-type.enum';
import { MaritalStatus } from '../../../../shared/domain/marital-status.enum';

export const CreateCustomerPhoneSchema = z.object({
  type: z.enum(PhoneType),
  number: z
    .string()
    .trim()
    .regex(/^\d{10,11}$/),
});

export const CreateCustomerSchema = z.object({
  name: z.string().trim().min(1).max(1024),
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
  phones: z.array(CreateCustomerPhoneSchema).optional(),
});

export class CreateCustomerDto extends createZodDto(CreateCustomerSchema, {
  type: 'output',
}) {}

export const CustomerCreateSchema = z.object({
  customer: CreateCustomerSchema,
});

export class CustomerCreateRequest extends createZodDto(CustomerCreateSchema, {
  type: 'output',
}) {}
