import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { CatalogItemType } from '../../../../shared/domain/catalog-item-type.enum';

export const CreateCatalogItemSchema = z.object({
  name: z.string().trim().min(1).max(256),
  itemType: z.enum(CatalogItemType),
  defaultPrice: z
    .string()
    .trim()
    .regex(/^\d{1,8}(\.\d{1,2})?$/)
    .optional()
    .nullable(),
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
