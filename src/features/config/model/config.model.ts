import { DatetimeSchema } from '../../../shared/model/common.model';
import { ConfigType } from '../../../shared/domain/config-type.enum';
import { z } from 'zod';

export const ConfigModelSchema = z.object({
  id: z.string(),
  name: z.string().trim().min(1).max(256),
  displayName: z.string().trim().min(1).max(256),
  description: z.string().trim().min(1).max(1024).optional(),
  version: z.int().positive(),
  userId: z.string().trim().min(1).max(64),
  tenantId: z.string().trim().min(1).max(64),
  inactivatedAt: DatetimeSchema.optional(),
  value: z.string().trim(),
  valueParsed: z.unknown().optional(),
  type: z.enum(ConfigType),
  group: z.string().trim().min(1).max(256),
});

export type ConfigModel = z.input<typeof ConfigModelSchema>;
