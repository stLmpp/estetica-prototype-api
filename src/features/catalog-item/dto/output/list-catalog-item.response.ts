import { createZodDto } from 'nestjs-zod';
import { createPaginatedResponseSchema } from '../../../../shared/model/response.model';
import { CatalogItemModelSchema } from '../../model/catalog-item.model';

export const ListCatalogItemResponseSchema = createPaginatedResponseSchema(
  CatalogItemModelSchema,
);

export class ListCatalogItemResponseModel extends createZodDto(
  ListCatalogItemResponseSchema,
) {}
