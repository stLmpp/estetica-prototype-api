import { z } from 'zod';
import { safe } from '../utils/safe';

const TIME_REGEXP = /^([01]\d|2[0-3]):[0-5]\d$/;

export const DayWorkingHoursSchema = z
  .object({
    start: z.string().regex(TIME_REGEXP),
    end: z.string().regex(TIME_REGEXP),
  })
  .refine((value) => value.start < value.end, {
    message: 'start must be before end',
  });

export const WeeklyWorkingHoursSchema = z.object({
  monday: DayWorkingHoursSchema.nullable(),
  tuesday: DayWorkingHoursSchema.nullable(),
  wednesday: DayWorkingHoursSchema.nullable(),
  thursday: DayWorkingHoursSchema.nullable(),
  friday: DayWorkingHoursSchema.nullable(),
  saturday: DayWorkingHoursSchema.nullable(),
  sunday: DayWorkingHoursSchema.nullable(),
});

export type DayWorkingHours = z.infer<typeof DayWorkingHoursSchema>;
export type WeeklyWorkingHours = z.infer<typeof WeeklyWorkingHoursSchema>;

export function isValidWorkingHoursJson(value: string): boolean {
  const [, result] = safe(
    () => WeeklyWorkingHoursSchema.safeParse(JSON.parse(value)).success,
  );
  return result ?? false;
}

export const WorkingHoursJsonSchema = z
  .string()
  .refine(isValidWorkingHoursJson, { message: 'Invalid working hours JSON' });
