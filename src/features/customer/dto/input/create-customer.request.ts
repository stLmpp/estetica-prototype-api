import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { PhoneType } from '../../../../shared/domain/phone-type.enum';
import { MaritalStatus } from '../../../../shared/domain/marital-status.enum';
import {
  DateParamSchema,
  PhoneNumberSchema,
  ZipCodeSchema,
} from '../../../../shared/model/common.model';

export const CreateCustomerPhoneSchema = z.object({
  type: z.enum(PhoneType),
  number: PhoneNumberSchema,
});

export const CreateCustomerSchema = z.object({
  name: z.string().trim().min(1).max(1024),
  birthDate: DateParamSchema.optional(),
  address: z.string().trim().min(1).max(1024).optional(),
  zipCode: ZipCodeSchema.optional(),
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
