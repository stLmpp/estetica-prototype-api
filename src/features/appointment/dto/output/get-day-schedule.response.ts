import { z } from 'zod';
import { createZodDto } from '@stlmpp/nestjs-zod';
import { createResponseSchema } from '../../../../shared/model/response.model';
import { DatetimeSchema } from '../../../../shared/model/common.model';

export const DayScheduleAppointmentSchema = z.object({
  id: z.string(),
  startTime: DatetimeSchema,
  endTime: DatetimeSchema,
  customerName: z.string(),
  catalogItemName: z.string(),
});

export type DayScheduleAppointmentDto = z.input<
  typeof DayScheduleAppointmentSchema
>;

export const GetDayScheduleResponseSchema = createResponseSchema(
  z.object({
    appointments: z.array(DayScheduleAppointmentSchema),
  }),
);

export class GetDayScheduleResponseModel extends createZodDto(
  GetDayScheduleResponseSchema,
) {}
