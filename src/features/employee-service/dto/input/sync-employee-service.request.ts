import { z } from 'zod';
import { createZodDto } from '@stlmpp/nestjs-zod';

export const SyncEmployeeServiceSchema = z.object({
  catalogItemIds: z.array(z.string().trim().min(1)),
});

export class SyncEmployeeServiceRequest extends createZodDto(
  SyncEmployeeServiceSchema,
  { type: 'output' },
) {}
