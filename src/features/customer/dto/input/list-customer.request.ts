import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { RequestPaginatedSchema } from '../../../../shared/model/request.model';
import {
  DatetimeParamSchema,
  PhoneNumberSchema,
} from '../../../../shared/model/common.model';

export const FilterCustomerSchema = RequestPaginatedSchema.extend({
  name: z.string().trim().min(1).max(1024).optional(),
  birthDate: DatetimeParamSchema.optional(),
  email: z.email().trim().max(1024).optional(),
  phone: PhoneNumberSchema.optional(),
});

export class FilterCustomerDto extends createZodDto(FilterCustomerSchema, {
  type: 'output',
}) {}
