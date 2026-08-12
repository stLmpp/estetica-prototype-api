import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { AppointmentStatus } from '../../../../shared/domain/appointment-staus.enum';
import { createResponseSchema } from '../../../../shared/model/response.model';
import { DatetimeSchema } from '../../../../shared/model/common.model';

export const CreateAppointmentResSchema = z.object({
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
});

export type CreateAppointmentResDto = z.input<
  typeof CreateAppointmentResSchema
>;

export const CreateAppointmentResponseSchema = createResponseSchema(
  z.object({
    appointment: CreateAppointmentResSchema,
  }),
);

export class CreateAppointmentResponseModel extends createZodDto(
  CreateAppointmentResponseSchema,
) {}
