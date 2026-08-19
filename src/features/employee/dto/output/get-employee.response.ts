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

export const GetEmployeePhoneResSchema = z.object({
  id: z.string(),
  type: z.enum(PhoneType),
  number: PhoneNumberSchema,
});

export const GetEmployeeResSchema = z.object({
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
  phones: z.array(GetEmployeePhoneResSchema).optional(),
  workingHours: WeeklyWorkingHoursSchema.nullable().optional(),
});

export type GetEmployeeResDto = z.input<typeof GetEmployeeResSchema>;

export const GetEmployeeResponseSchema = createResponseSchema(
  z.object({
    employee: GetEmployeeResSchema,
  }),
);

export class GetEmployeeResponseModel extends createZodDto(
  GetEmployeeResponseSchema,
) {}
