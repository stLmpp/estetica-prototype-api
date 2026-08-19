import { z } from 'zod';
import { createZodDto } from '@stlmpp/nestjs-zod';
import { DatetimeParamSchema } from '../../../../shared/model/common.model';

export const CreateAppointmentSchema = z
  .object({
    customerId: z.string().trim().min(1),
    employeeId: z.string().trim().min(1),
    catalogItemId: z.string().trim().min(1),
    startTime: DatetimeParamSchema,
    endTime: DatetimeParamSchema,
    notes: z.string().trim().min(1).max(2048).optional(),
    priceApplied: z
      .string()
      .trim()
      .regex(/^\d{1,8}(\.\d{1,2})?$/)
      .optional(),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: 'endTime must be after startTime',
    path: ['endTime'],
  });

export class CreateAppointmentDto extends createZodDto(
  CreateAppointmentSchema,
  { type: 'output' },
) {}

export const AppointmentCreateSchema = z.object({
  appointment: CreateAppointmentSchema,
});

export class AppointmentCreateRequest extends createZodDto(
  AppointmentCreateSchema,
  { type: 'output' },
) {}
