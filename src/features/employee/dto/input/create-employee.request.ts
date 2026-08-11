import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { PhoneType } from '../../../../shared/domain/phone-type.enum';
import { MaritalStatus } from '../../../../shared/domain/marital-status.enum';
import {
  DateParamSchema,
  PhoneNumberSchema,
  ZipCodeSchema,
} from '../../../../shared/model/common.model';

export const CreateEmployeePhoneSchema = z.object({
  type: z.enum(PhoneType),
  number: PhoneNumberSchema,
});

export const CreateEmployeeSchema = z.object({
  name: z.string().trim().min(1).max(1024),
  role: z.string().trim().min(1).max(256),
  birthDate: DateParamSchema.optional(),
  address: z.string().trim().min(1).max(1024).optional(),
  zipCode: ZipCodeSchema.optional(),
  neighborhood: z.string().trim().min(1).max(256).optional(),
  city: z.string().trim().min(1).max(256).optional(),
  state: z.string().trim().min(1).max(256).optional(),
  maritalStatus: z.enum(MaritalStatus).optional(),
  email: z.email().trim().optional(),
  phones: z.array(CreateEmployeePhoneSchema).optional(),
});

export class CreateEmployeeDto extends createZodDto(CreateEmployeeSchema, {
  type: 'output',
}) {}

export const EmployeeCreateSchema = z.object({
  employee: CreateEmployeeSchema,
});

export class EmployeeCreateRequest extends createZodDto(EmployeeCreateSchema, {
  type: 'output',
}) {}
