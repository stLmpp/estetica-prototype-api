import { z } from 'zod';
import { GLOBAL_TENANT, GLOBAL_USER } from '../../../../auth/constants';
import { createZodDto } from 'nestjs-zod';

export const GetGroupRequestSchema = z.object({
  group: z.string().trim().min(1).max(64),
  tenantId: z.string().trim().min(1).max(64).default(GLOBAL_TENANT),
  userId: z.string().trim().min(1).max(64).default(GLOBAL_USER),
});

export class GetGroupRequest extends createZodDto(GetGroupRequestSchema, {
  type: 'output',
}) {}
