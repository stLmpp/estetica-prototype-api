import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { ConfigType } from '../../../../shared/domain/config-type.enum';

export const PublishConfigSchema = z.object({
  name: z.string().trim().min(1).max(256),
  displayName: z.string().trim().min(1).max(256),
  description: z.string().trim().min(1).max(2048).optional(),
  userId: z.string().trim().min(1).max(64).optional(),
  tenantId: z.string().trim().min(1).max(64).optional(),
  value: z.string().trim().min(1).max(65_536),
  type: z.enum(ConfigType),
  group: z.string().trim().min(1).max(256).optional(),
});

export class PublishConfigDto extends createZodDto(PublishConfigSchema, {
  type: 'output',
}) {}

export const PublishConfigRequestSchema = z.object({
  config: PublishConfigSchema,
});

export class PublishConfigRequest extends createZodDto(
  PublishConfigRequestSchema,
  { type: 'output' },
) {}
