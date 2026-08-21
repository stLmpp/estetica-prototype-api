import { z } from 'zod';
import { createZodDto } from '@stlmpp/nestjs-zod';
import { DatetimeParamSchema } from '../../../../shared/model/common.model';
import { CustomerFollowupItemInputSchema } from '../../model/customer-followup.model';

export const UpdateCustomerFollowupSchema = z
  .object({
    text: z.string().trim().min(1).optional(),
    date: DatetimeParamSchema.optional(),
    appointmentId: z.string().trim().min(1).optional().nullable(),
    saleId: z.string().trim().min(1).optional().nullable(),
    items: z.array(CustomerFollowupItemInputSchema).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

export class UpdateCustomerFollowupDto extends createZodDto(
  UpdateCustomerFollowupSchema,
  { type: 'output' },
) {}

export const UpdateCustomerFollowupRequestSchema = z.object({
  customerFollowup: UpdateCustomerFollowupSchema,
});

export class UpdateCustomerFollowupRequest extends createZodDto(
  UpdateCustomerFollowupRequestSchema,
  { type: 'output' },
) {}
