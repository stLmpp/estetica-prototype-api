import { z } from 'zod';

export const PaginationMetadataSchema = z.object({
  total: z.int().positive(),
  page: z.int().positive(),
  limit: z.int().positive(),
});

export function createResponseSchema<T extends z.ZodTypeAny>(schema: T) {
  return z.object({
    data: schema,
  });
}

export function createPaginatedResponseSchema<T extends z.ZodTypeAny>(
  schema: T,
) {
  return z.object({
    data: z.object({
      items: z.array(schema),
    }),
    meta: PaginationMetadataSchema,
  });
}
