import { z } from 'zod';
import { CatalogItemType } from '../../../shared/domain/catalog-item-type.enum';

export const CatalogItemModelSchema = z.object({
  id: z.string(),
  name: z.string().trim().min(1).max(256),
  itemType: z.enum(CatalogItemType),
  defaultPrice: z
    .string()
    .trim()
    .regex(/^\d+(\.\d{1,2})?$/)
    .optional(),
  active: z.boolean(),
});

export type CatalogItemModel = z.input<typeof CatalogItemModelSchema>;
