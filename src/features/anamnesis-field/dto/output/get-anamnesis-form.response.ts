import { z } from 'zod';
import { createZodDto } from '@stlmpp/nestjs-zod';
import { createResponseSchema } from '../../../../shared/model/response.model';
import { AnamnesisFormModelSchema } from '../../model/anamnesis-form.model';

export const GetAnamnesisFormResponseSchema = createResponseSchema(
  z.object({
    anamnesisForm: AnamnesisFormModelSchema,
  }),
);

export class GetAnamnesisFormResponseModel extends createZodDto(
  GetAnamnesisFormResponseSchema,
) {}
