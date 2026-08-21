import { z } from 'zod';
import { createZodDto } from '@stlmpp/nestjs-zod';
import { DatetimeParamSchema } from '../../../../shared/model/common.model';
import { CustomerFollowupItemInputSchema } from '../../model/customer-followup.model';

export const CreateCustomerFollowupSchema = z.object({
  customerId: z.string().trim().min(1),
  text: z.string().trim().min(1),
  date: DatetimeParamSchema.optional(),
  appointmentId: z.string().trim().min(1).optional(),
  saleId: z.string().trim().min(1).optional(),
  items: z.array(CustomerFollowupItemInputSchema).optional(),
});

export class CreateCustomerFollowupDto extends createZodDto(
  CreateCustomerFollowupSchema,
  { type: 'output' },
) {}

export const CreateCustomerFollowupRequestSchema = z.object({
  customerFollowup: CreateCustomerFollowupSchema,
});

export class CreateCustomerFollowupRequest extends createZodDto(
  CreateCustomerFollowupRequestSchema,
  { type: 'output' },
) {}
