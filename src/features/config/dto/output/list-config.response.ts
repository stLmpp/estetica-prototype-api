import {
  createPaginatedResponseSchema,
  createResponseSchema,
} from '../../../../shared/model/response.model';
import { createZodDto } from '@stlmpp/nestjs-zod';
import { z } from 'zod';
import { ConfigModelSchema } from '../../model/config.model';

export const ListConfigResponse = createResponseSchema(
  z.object({
    configs: z.array(ConfigModelSchema),
  }),
);

export const ListConfigPaginatedResponseSchema =
  createPaginatedResponseSchema(ConfigModelSchema);

export class ListConfigPaginatedResponseModel extends createZodDto(
  ListConfigPaginatedResponseSchema,
) {}

export class ListConfigResponseModel extends createZodDto(ListConfigResponse) {}
