import { exception } from '../../core/exception/exception';

export const CatalogItemExceptions = {
  catalogItemNotFound: exception({
    code: 'CATALOG_ITEM_NOT_FOUND',
    message: 'Catalog item not found',
    status: 404,
  }),
} as const;
