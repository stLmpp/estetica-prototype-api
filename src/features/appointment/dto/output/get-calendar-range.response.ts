import { z } from 'zod';
import { createZodDto } from '@stlmpp/nestjs-zod';
import { AppointmentStatus } from '../../../../shared/domain/appointment-staus.enum';
import { createResponseSchema } from '../../../../shared/model/response.model';
import { DatetimeSchema } from '../../../../shared/model/common.model';

export const CalendarAppointmentSchema = z.object({
  id: z.string(),
  status: z.enum(AppointmentStatus),
  startTime: DatetimeSchema,
  endTime: DatetimeSchema,
  customerName: z.string(),
  employeeName: z.string(),
  catalogItemName: z.string(),
});

export type CalendarAppointmentDto = z.input<typeof CalendarAppointmentSchema>;

export const GetCalendarRangeResponseSchema = createResponseSchema(
  z.object({
    appointments: z.array(CalendarAppointmentSchema),
  }),
);

export class GetCalendarRangeResponseModel extends createZodDto(
  GetCalendarRangeResponseSchema,
) {}
