import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const RequestPaginatedSchema = z.object({
  page: z
    .codec(z.string().trim().regex(/^\d+$/), z.number().int(), {
      encode: (val) => String(val),
      decode: (val) => Number(val),
    })
    .default(1),
  limit: z
    .codec(z.string().trim().regex(/^\d+$/), z.number().int(), {
      encode: (val) => String(val),
      decode: (val) => Number(val),
    })
    .default(10),
});

export class RequestPaginatedModel extends createZodDto(
  RequestPaginatedSchema,
) {}
