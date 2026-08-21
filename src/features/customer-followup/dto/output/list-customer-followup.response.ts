import { z } from 'zod';
import { createZodDto } from '@stlmpp/nestjs-zod';
import { createPaginatedResponseSchema } from '../../../../shared/model/response.model';
import { DatetimeSchema } from '../../../../shared/model/common.model';

export const CustomerFollowupListItemSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  text: z.string(),
  date: DatetimeSchema,
  appointmentId: z.string().optional(),
  saleId: z.string().optional(),
});

export const ListCustomerFollowupResponseSchema = createPaginatedResponseSchema(
  CustomerFollowupListItemSchema,
);

export class ListCustomerFollowupResponseModel extends createZodDto(
  ListCustomerFollowupResponseSchema,
) {}
