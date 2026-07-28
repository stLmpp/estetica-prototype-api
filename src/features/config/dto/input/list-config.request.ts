import { RequestPaginatedSchema } from '../../../../shared/model/request.model';
import { BooleanParamSchema } from '../../../../shared/model/common.model';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { CONFIG_GROUP_GLOBAL } from '../../config.constants';
import { GLOBAL_TENANT, GLOBAL_USER } from '../../../../auth/constants';

export const FilterConfigSchema = RequestPaginatedSchema.extend({
  name: z.string().trim().min(1).max(64).optional(),
  group: z.string().trim().min(1).max(64).default(CONFIG_GROUP_GLOBAL),
  userId: z.string().trim().min(1).max(64).default(GLOBAL_USER),
  tenantId: z.string().trim().min(1).max(64).default(GLOBAL_TENANT),
  version: z.int().positive().optional(),
  showInactivated: BooleanParamSchema.optional(),
});

export class FilterConfigDto extends createZodDto(FilterConfigSchema, {
  type: 'output',
}) {}
