import { z } from 'zod';
import { createZodDto } from '@stlmpp/nestjs-zod';
import { PhoneType } from '../../../../shared/domain/phone-type.enum';
import { MaritalStatus } from '../../../../shared/domain/marital-status.enum';
import { createResponseSchema } from '../../../../shared/model/response.model';
import {
  DateSchema,
  PhoneNumberSchema,
  ZipCodeSchema,
} from '../../../../shared/model/common.model';
import { WeeklyWorkingHoursSchema } from '../../../../shared/model/working-hours.model';

export const EmployeePhoneResSchema = z.object({
  id: z.string(),
  type: z.enum(PhoneType),
  number: PhoneNumberSchema,
});

export const CreateEmployeeResSchema = z.object({
  id: z.string(),
  name: z.string().trim().min(1).max(1024),
  role: z.string().trim().min(1).max(256),
  birthDate: DateSchema.optional(),
  address: z.string().trim().min(1).max(1024).optional(),
  zipCode: ZipCodeSchema.optional(),
  neighborhood: z.string().trim().min(1).max(256).optional(),
  city: z.string().trim().min(1).max(256).optional(),
  state: z.string().trim().min(1).max(256).optional(),
  maritalStatus: z.enum(MaritalStatus).optional(),
  email: z.email().trim().optional(),
  phones: z.array(EmployeePhoneResSchema).optional(),
  workingHours: WeeklyWorkingHoursSchema.nullable().optional(),
});

export type CreateEmployeeResDto = z.input<typeof CreateEmployeeResSchema>;

export const CreateEmployeeResponseSchema = createResponseSchema(
  z.object({
    employee: CreateEmployeeResSchema,
  }),
);

export class CreateEmployeeResponseModel extends createZodDto(
  CreateEmployeeResponseSchema,
) {}
