import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { AppointmentStatus } from '../../../../shared/domain/appointment-staus.enum';

export const UpdateAppointmentStatusSchema = z.object({
  status: z.enum(AppointmentStatus),
});

export class UpdateAppointmentStatusDto extends createZodDto(
  UpdateAppointmentStatusSchema,
  { type: 'output' },
) {}

export const UpdateAppointmentStatusRequestSchema = z.object({
  appointment: UpdateAppointmentStatusSchema,
});

export class UpdateAppointmentStatusRequest extends createZodDto(
  UpdateAppointmentStatusRequestSchema,
  { type: 'output' },
) {}
