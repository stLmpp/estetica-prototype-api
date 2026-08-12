import { z } from 'zod';
import { CatalogItemType } from '../../../shared/domain/catalog-item-type.enum';
import { DurationSchema } from '../../../shared/model/common.model';

export const CatalogItemModelSchema = z.object({
  id: z.string(),
  name: z.string().trim().min(1).max(256),
  itemType: z.enum(CatalogItemType),
  defaultPrice: z
    .string()
    .trim()
    .regex(/^\d{1,8}(\.\d{1,2})?$/)
    .optional(),
  defaultDuration: DurationSchema.optional(),
  active: z.boolean(),
});

export type CatalogItemModel = z.input<typeof CatalogItemModelSchema>;
