import { z } from 'zod';
import { createZodDto } from '@stlmpp/nestjs-zod';
import { DatetimeParamSchema } from '../../../../shared/model/common.model';

export const GetCalendarRangeSchema = z.object({
  from: DatetimeParamSchema,
  to: DatetimeParamSchema,
  employeeId: z.string().trim().min(1).optional(),
});

export class GetCalendarRangeDto extends createZodDto(GetCalendarRangeSchema, {
  type: 'output',
}) {}
