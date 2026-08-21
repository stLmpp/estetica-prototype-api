import { z } from 'zod';
import { createZodDto } from '@stlmpp/nestjs-zod';
import { RequestPaginatedSchema } from '../../../../shared/model/request.model';

export const FilterCustomerFollowupSchema = RequestPaginatedSchema.extend({
  customerId: z.string().trim().min(1),
});

export class FilterCustomerFollowupDto extends createZodDto(
  FilterCustomerFollowupSchema,
  { type: 'output' },
) {}
