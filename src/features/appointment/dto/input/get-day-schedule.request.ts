import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { DatetimeParamSchema } from '../../../../shared/model/common.model';

export const GetDayScheduleSchema = z.object({
  employeeId: z.string().trim().min(1),
  from: DatetimeParamSchema,
  to: DatetimeParamSchema,
});

export class GetDayScheduleDto extends createZodDto(GetDayScheduleSchema, {
  type: 'output',
}) {}
