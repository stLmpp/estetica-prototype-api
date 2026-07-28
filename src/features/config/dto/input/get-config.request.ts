import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { GLOBAL_TENANT, GLOBAL_USER } from '../../../../auth/constants';
import { CONFIG_GROUP_GLOBAL } from '../../config.constants';

export const GetConfigRequestSchema = z.object({
  name: z.string().trim().min(1).max(64),
  version: z.union([z.int().positive(), z.literal('latest')]),
  group: z.string().trim().min(1).max(64).default(CONFIG_GROUP_GLOBAL),
  tenantId: z.string().trim().min(1).max(64).default(GLOBAL_TENANT),
  userId: z.string().trim().min(1).max(64).default(GLOBAL_USER),
});

export class GetConfigRequest extends createZodDto(GetConfigRequestSchema, {
  type: 'output',
}) {}
