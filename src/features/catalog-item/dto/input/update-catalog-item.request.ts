import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { CatalogItemType } from '../../../../shared/domain/catalog-item-type.enum';

export const UpdateCatalogItemSchema = z
  .object({
    name: z.string().trim().min(1).max(256).optional(),
    itemType: z.enum(CatalogItemType).optional(),
    defaultPrice: z
      .string()
      .trim()
      .regex(/^\d{1,8}(\.\d{1,2})?$/)
      .optional()
      .nullable(),
    active: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

export class UpdateCatalogItemDto extends createZodDto(
  UpdateCatalogItemSchema,
  { type: 'output' },
) {}

export const UpdateCatalogItemRequestSchema = z.object({
  catalogItem: UpdateCatalogItemSchema,
});

export class UpdateCatalogItemRequest extends createZodDto(
  UpdateCatalogItemRequestSchema,
  { type: 'output' },
) {}
