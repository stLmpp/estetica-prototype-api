import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { AppointmentStatus } from '../../../../shared/domain/appointment-staus.enum';
import { createPaginatedResponseSchema } from '../../../../shared/model/response.model';
import { DatetimeSchema } from '../../../../shared/model/common.model';

export const AppointmentSchema = z.object({
  id: z.string(),
  status: z.enum(AppointmentStatus),
  startTime: DatetimeSchema,
  endTime: DatetimeSchema,
  customerId: z.string(),
  customerName: z.string(),
  employeeId: z.string(),
  employeeName: z.string(),
  catalogItemId: z.string(),
  catalogItemName: z.string(),
});

export const ListAppointmentResponseSchema =
  createPaginatedResponseSchema(AppointmentSchema);

export class ListAppointmentResponseModel extends createZodDto(
  ListAppointmentResponseSchema,
) {}
