import { z } from 'zod';
import { IntParamSchema } from './common.model';

export const RequestPaginatedSchema = z.object({
  page: IntParamSchema.default(1),
  limit: z
    .codec(z.enum(['10', '25', '50', '100']), z.int(), {
      encode: (val) => String(val) as never,
      decode: (val) => Number(val),
    })
    .default(10),
});
