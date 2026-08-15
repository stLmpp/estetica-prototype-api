import { z } from 'zod';
import dayjs from 'dayjs';
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

export function parseWorkingHours(
  raw: string | null | undefined,
): WeeklyWorkingHours | null {
  if (!raw) {
    return null;
  }
  const [error, parsed] = safe(() =>
    WeeklyWorkingHoursSchema.parse(JSON.parse(raw)),
  );
  return error ? null : parsed;
}

export const WEEKDAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const satisfies readonly (keyof WeeklyWorkingHours)[];

const WEEKDAY_BY_DAYJS_DAY: Record<number, (typeof WEEKDAYS)[number]> = {
  0: 'sunday',
  1: 'monday',
  2: 'tuesday',
  3: 'wednesday',
  4: 'thursday',
  5: 'friday',
  6: 'saturday',
};

export function getWeekdayKey(date: Date): (typeof WEEKDAYS)[number] {
  return WEEKDAY_BY_DAYJS_DAY[dayjs(date).day()]!;
}

const DEFAULT_DAY_WORKING_HOURS: DayWorkingHours = {
  start: '08:00',
  end: '20:00',
};

/**
 * Resolves which hours apply to a given weekday: the employee's own
 * schedule if they have one configured at all (even if that specific day is
 * `null`, i.e. a day off — an explicit day off must not fall back to the
 * org), otherwise the organization's, otherwise a default 08:00-20:00.
 */
export function resolveDayWorkingHours(
  weekday: (typeof WEEKDAYS)[number],
  employeeWorkingHours: WeeklyWorkingHours | null | undefined,
  organizationWorkingHours: WeeklyWorkingHours | null | undefined,
): DayWorkingHours | null {
  if (employeeWorkingHours) {
    return employeeWorkingHours[weekday];
  }
  if (organizationWorkingHours) {
    return organizationWorkingHours[weekday];
  }
  return DEFAULT_DAY_WORKING_HOURS;
}

export function isWithinDayWorkingHours(
  dayHours: DayWorkingHours,
  start: Date,
  end: Date,
): boolean {
  const startTime = dayjs(start).format('HH:mm');
  const endTime = dayjs(end).format('HH:mm');
  return startTime >= dayHours.start && endTime <= dayHours.end;
}
