import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { ConfigType } from '../../../../shared/domain/config-type.enum';
import { AuthOrgRole, AuthRole } from '../../../../auth/constants';

export const BasePublishConfigSchema = z.object({
  name: z.string().trim().min(1).max(256),
  displayName: z.string().trim().min(1).max(256),
  description: z.string().trim().min(1).max(2048).optional(),
  userId: z.string().trim().min(1).max(64).optional(),
  tenantId: z.string().trim().min(1).max(64).optional(),
  value: z.string().trim().min(1).max(65_536),
  type: z.enum(ConfigType),
  group: z.string().trim().min(1).max(256).optional(),
});

const PublishConfigSchema = z.discriminatedUnion('roleType', [
  BasePublishConfigSchema.extend({
    roleType: z.literal('org'),
    role: z.enum(AuthRole),
  }),
  BasePublishConfigSchema.extend({
    roleType: z.literal('general'),
    orgRole: z.enum(AuthOrgRole),
  }),
  BasePublishConfigSchema.extend({
    roleType: z.undefined().optional(),
  }),
]);

export type PublishConfigDto = z.infer<typeof PublishConfigSchema>;

export const PublishConfigRequestSchema = z.object({
  config: PublishConfigSchema,
});

export type PublishConfigRequest = z.infer<typeof PublishConfigRequestSchema>;
