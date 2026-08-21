import { z } from 'zod';
import { createZodDto } from '@stlmpp/nestjs-zod';
import { createResponseSchema } from '../../../../shared/model/response.model';
import { CustomerFollowupResSchema } from './create-customer-followup.response';

export const GetCustomerFollowupResSchema = CustomerFollowupResSchema;

export type GetCustomerFollowupResDto = z.input<
  typeof GetCustomerFollowupResSchema
>;

export const GetCustomerFollowupResponseSchema = createResponseSchema(
  z.object({ customerFollowup: GetCustomerFollowupResSchema }),
);

export class GetCustomerFollowupResponseModel extends createZodDto(
  GetCustomerFollowupResponseSchema,
) {}
