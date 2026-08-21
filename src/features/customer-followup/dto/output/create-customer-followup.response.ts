import { z } from 'zod';
import { createZodDto } from '@stlmpp/nestjs-zod';
import { createResponseSchema } from '../../../../shared/model/response.model';
import { DatetimeSchema } from '../../../../shared/model/common.model';
import { CustomerFollowupItemModelSchema } from '../../model/customer-followup.model';

export const CustomerFollowupResSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  text: z.string(),
  date: DatetimeSchema,
  appointmentId: z.string().optional(),
  saleId: z.string().optional(),
  items: z.array(CustomerFollowupItemModelSchema),
});

export type CustomerFollowupResDto = z.input<typeof CustomerFollowupResSchema>;

export const CreateCustomerFollowupResponseSchema = createResponseSchema(
  z.object({ customerFollowup: CustomerFollowupResSchema }),
);

export class CreateCustomerFollowupResponseModel extends createZodDto(
  CreateCustomerFollowupResponseSchema,
) {}
