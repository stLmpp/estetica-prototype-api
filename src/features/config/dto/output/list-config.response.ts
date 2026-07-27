import { createPaginatedResponseSchema } from '../../../../shared/model/response.model';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { ConfigType } from '../../../../shared/domain/config-type.enum';

export const ConfigSchema = z.object({
  id: z.string(),
  name: z.string().trim().min(1).max(64),
  displayName: z.string().trim().min(1).max(128),
  group: z.string().trim().min(1).max(64),
  version: z.int().positive(),
  description: z.string().trim().min(1).max(2048).optional(),
  userId: z.string().trim().min(1).max(64),
  tenantId: z.string().trim().min(1).max(64),
  value: z.string().trim(),
  type: z.enum(ConfigType),
});

export const ListConfigResponseSchema =
  createPaginatedResponseSchema(ConfigSchema);

export class ListConfigResponseModel extends createZodDto(
  ListConfigResponseSchema,
) {}
