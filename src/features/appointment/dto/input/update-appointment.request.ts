import { z } from 'zod';
import { createZodDto } from '@stlmpp/nestjs-zod';
import { DatetimeParamSchema } from '../../../../shared/model/common.model';

export const UpdateAppointmentSchema = z
  .object({
    startTime: DatetimeParamSchema.optional(),
    endTime: DatetimeParamSchema.optional(),
    notes: z.string().trim().min(1).max(2048).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

export class UpdateAppointmentDto extends createZodDto(
  UpdateAppointmentSchema,
  { type: 'output' },
) {}

export const UpdateAppointmentRequestSchema = z.object({
  appointment: UpdateAppointmentSchema,
});

export class UpdateAppointmentRequest extends createZodDto(
  UpdateAppointmentRequestSchema,
  { type: 'output' },
) {}
