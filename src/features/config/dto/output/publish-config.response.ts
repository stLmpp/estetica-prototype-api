import { z } from 'zod';
import { createZodDto } from '@stlmpp/nestjs-zod';
import { createResponseSchema } from '../../../../shared/model/response.model';
import { ConfigModelSchema } from '../../model/config.model';

export const PublishConfigResponseSchema = createResponseSchema(
  z.object({
    config: ConfigModelSchema,
    oldConfig: ConfigModelSchema.optional(),
  }),
);

export class PublishConfigResponseModel extends createZodDto(
  PublishConfigResponseSchema,
) {}
