import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { PhoneType } from '../../../../shared/domain/phone-type.enum';
import { MaritalStatus } from '../../../../shared/domain/marital-status.enum';
import { createResponseSchema } from '../../../../shared/model/response.model';

export const CustomerPhoneResSchema = z.object({
  id: z.number(),
  type: z.enum(PhoneType),
  number: z.string(),
});

export const CreateCustomerResSchema = z.object({
  id: z.number(),
  name: z.string().trim().min(1).max(1024),
  birthDate: z
    .codec(z.date(), z.iso.datetime(), {
      encode: (val) => new Date(val),
      decode: (val) => val.toISOString(),
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
  phones: z.array(CustomerPhoneResSchema).optional(),
});

export type CreateCustomerResDto = z.input<typeof CreateCustomerResSchema>;

export const CreateCustomerResponseSchema = createResponseSchema(
  z.object({
    customer: CreateCustomerResSchema,
  }),
);

export class CreateCustomerResponseModel extends createZodDto(
  CreateCustomerResponseSchema,
) {}
