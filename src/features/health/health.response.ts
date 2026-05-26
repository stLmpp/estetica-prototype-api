import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export enum HealthStatus {
  OK = 'OK',
  NOK = 'NOK',
}

export const HealthSchema = z.object({
  status: z.nativeEnum(HealthStatus),
});

export class HealthResponse extends createZodDto(HealthSchema) {}
