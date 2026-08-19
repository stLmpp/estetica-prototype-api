import { z } from 'zod';
import { createZodDto } from '@stlmpp/nestjs-zod';
import { CatalogItemType } from '../../../../shared/domain/catalog-item-type.enum';
import { DurationSchema } from '../../../../shared/model/common.model';

export const CreateCatalogItemSchema = z.object({
  name: z.string().trim().min(1).max(256),
  itemType: z.enum(CatalogItemType),
  defaultPrice: z
    .string()
    .trim()
    .regex(/^\d{1,8}(\.\d{1,2})?$/)
    .optional()
    .nullable(),
  defaultDuration: DurationSchema.optional().nullable(),
  active: z.boolean().default(true),
});

export class CreateCatalogItemDto extends createZodDto(
  CreateCatalogItemSchema,
  { type: 'output' },
) {}

export const CreateCatalogItemRequestSchema = z.object({
  catalogItem: CreateCatalogItemSchema,
});

export class CreateCatalogItemRequest extends createZodDto(
  CreateCatalogItemRequestSchema,
  { type: 'output' },
) {}
