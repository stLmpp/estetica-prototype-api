import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const PaginationMetadataSchema = z.object({
  total: z.number(),
  page: z.number(),
  limit: z.number(),
});

export class PaginationMetadataModel extends createZodDto(
  PaginationMetadataSchema,
) {
  constructor(total: number, page: number, limit: number) {
    super();
    this.total = total;
    this.page = page;
    this.limit = limit;
  }

  static from({ total, limit, page }: PaginationMetadataModel) {
    return new PaginationMetadataModel(total, page, limit);
  }
}

export const ErrorDetailSchema = z.object({
  issue: z.string(),
  field: z.string(),
});

export class ErrorDetailModel extends createZodDto(ErrorDetailSchema) {
  constructor(issue: string, field: string) {
    super();
    this.issue = issue;
    this.field = field;
  }
}

export const ErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.array(ErrorDetailSchema).optional(),
});

export class ErrorModel extends createZodDto(ErrorSchema) {
  constructor(code: string, message: string, details?: ErrorDetailModel[]) {
    super();
    this.code = code;
    this.message = message;
    this.details = details;
  }
}

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

export class ResponseErrorModel extends Error {
  constructor(error: ErrorModel, status: number) {
    super(error.message);
    this.error = error;
    this.statusCode = status;
  }

  readonly error: ErrorModel;

  readonly statusCode: number;

  toJSON() {
    return {
      statusCode: this.statusCode,
      error: this.error,
    };
  }
}
