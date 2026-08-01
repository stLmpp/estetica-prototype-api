import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { RequestPaginatedSchema } from '../../../../shared/model/request.model';
import { BooleanParamSchema } from '../../../../shared/model/common.model';
import { CatalogItemType } from '../../../../shared/domain/catalog-item-type.enum';

export const FilterCatalogItemSchema = RequestPaginatedSchema.extend({
  name: z.string().trim().min(1).max(256).optional(),
  itemType: z.enum(CatalogItemType).optional(),
  active: BooleanParamSchema.optional(),
});

export class FilterCatalogItemDto extends createZodDto(
  FilterCatalogItemSchema,
  { type: 'output' },
) {}
