import { z } from 'zod';
import { createZodDto } from '@stlmpp/nestjs-zod';
import { AppointmentStatus } from '../../../../shared/domain/appointment-staus.enum';
import { createResponseSchema } from '../../../../shared/model/response.model';
import { DatetimeSchema } from '../../../../shared/model/common.model';

export const GetAppointmentResSchema = z.object({
  id: z.string(),
  status: z.enum(AppointmentStatus),
  startTime: DatetimeSchema,
  endTime: DatetimeSchema,
  notes: z.string().optional(),
  customerId: z.string(),
  customerName: z.string(),
  employeeId: z.string(),
  employeeName: z.string(),
  catalogItemId: z.string(),
  catalogItemName: z.string(),
  priceApplied: z.string(),
  saleId: z.string().optional(),
});

export type GetAppointmentResDto = z.input<typeof GetAppointmentResSchema>;

export const GetAppointmentResponseSchema = createResponseSchema(
  z.object({
    appointment: GetAppointmentResSchema,
  }),
);

export class GetAppointmentResponseModel extends createZodDto(
  GetAppointmentResponseSchema,
) {}
