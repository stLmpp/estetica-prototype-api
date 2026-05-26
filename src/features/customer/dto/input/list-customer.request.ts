import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { RequestPaginatedSchema } from '../../../../shared/model/request.model';

export const FilterCustomerSchema = RequestPaginatedSchema.extend({
  name: z.string().trim().min(1).max(1024).optional(),
  birthDate: z
    .codec(z.iso.datetime(), z.date(), {
      encode: (val) => val.toISOString(),
      decode: (val) => new Date(val),
    })
    .optional(),
  email: z.email().trim().max(1024).optional(),
  phone: z
    .string()
    .trim()
    .regex(/^\d{10,11}$/)
    .optional(),
});

export class FilterCustomerDto extends createZodDto(FilterCustomerSchema, {
  type: 'output',
}) {}
