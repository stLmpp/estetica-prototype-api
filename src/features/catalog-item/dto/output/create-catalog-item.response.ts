import { z } from 'zod';
import { createZodDto } from '@stlmpp/nestjs-zod';
import { createResponseSchema } from '../../../../shared/model/response.model';
import { CatalogItemModelSchema } from '../../model/catalog-item.model';

export const CreateCatalogItemResponseSchema = createResponseSchema(
  z.object({
    catalogItem: CatalogItemModelSchema,
  }),
);

export class CreateCatalogItemResponseModel extends createZodDto(
  CreateCatalogItemResponseSchema,
) {}
