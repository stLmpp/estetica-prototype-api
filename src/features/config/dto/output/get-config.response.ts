import { z } from 'zod';
import { createResponseSchema } from '../../../../shared/model/response.model';
import { createZodDto } from '@stlmpp/nestjs-zod';
import { ConfigModelSchema } from '../../model/config.model';

export const GetConfigResponseSchema = createResponseSchema(
  z.object({
    config: ConfigModelSchema,
  }),
);

export class GetConfigResponse extends createZodDto(GetConfigResponseSchema) {}
