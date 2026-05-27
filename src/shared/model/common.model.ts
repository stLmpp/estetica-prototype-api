import { z } from 'zod';
import dayjs from 'dayjs';

export const IntParamSchema = z.codec(
  z.string().trim().regex(/^\d+$/),
  z.int(),
  {
    encode: (val) => String(val),
    decode: (val) => Number(val),
  },
);

export const DateParamSchema = z.codec(z.iso.date(), z.date(), {
  encode: (val) => dayjs(val).format('YYYY-MM-DD'),
  decode: (val) => new Date(val),
});

export const DateSchema = z.codec(z.date(), z.iso.date(), {
  encode: (val) => new Date(val),
  decode: (val) => dayjs(val).format('YYYY-MM-DD'),
});

export const DatetimeParamSchema = z.codec(z.iso.datetime(), z.date(), {
  encode: (val) => val.toISOString(),
  decode: (val) => new Date(val),
});

export const DatetimeSchema = z.codec(z.date(), z.iso.datetime(), {
  encode: (val) => new Date(val),
  decode: (val) => val.toISOString(),
});

export const PhoneNumberSchema = z
  .string()
  .trim()
  .regex(/^\d{10,11}$/);

export const ZipCodeSchema = z
  .string()
  .trim()
  .regex(/^\d{8}$/);
