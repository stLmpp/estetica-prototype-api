import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { RequestPaginatedSchema } from '../../../../shared/model/request.model';
import { DatetimeParamSchema } from '../../../../shared/model/common.model';
import { AppointmentStatus } from '../../../../shared/domain/appointment-staus.enum';

export const FilterAppointmentSchema = RequestPaginatedSchema.extend({
  customerId: z.string().trim().min(1).optional(),
  employeeId: z.string().trim().min(1).optional(),
  status: z.enum(AppointmentStatus).optional(),
  from: DatetimeParamSchema.optional(),
  to: DatetimeParamSchema.optional(),
});

export class FilterAppointmentDto extends createZodDto(
  FilterAppointmentSchema,
  { type: 'output' },
) {}
