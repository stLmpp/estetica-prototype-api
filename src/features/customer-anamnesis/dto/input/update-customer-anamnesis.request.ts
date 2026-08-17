import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { DatetimeParamSchema } from '../../../../shared/model/common.model';
import { CustomerAnamnesisAnswersInputSchema } from '../../model/customer-anamnesis-answer-input.model';

export const UpdateCustomerAnamnesisSchema = z
  .object({
    date: DatetimeParamSchema.optional(),
    answers: CustomerAnamnesisAnswersInputSchema.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

export class UpdateCustomerAnamnesisDto extends createZodDto(
  UpdateCustomerAnamnesisSchema,
  { type: 'output' },
) {}

export const UpdateCustomerAnamnesisRequestSchema = z.object({
  customerAnamnesis: UpdateCustomerAnamnesisSchema,
});

export class UpdateCustomerAnamnesisRequest extends createZodDto(
  UpdateCustomerAnamnesisRequestSchema,
  { type: 'output' },
) {}
