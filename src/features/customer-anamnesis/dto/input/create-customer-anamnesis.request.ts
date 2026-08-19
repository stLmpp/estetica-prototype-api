import { z } from 'zod';
import { createZodDto } from '@stlmpp/nestjs-zod';
import { DatetimeParamSchema } from '../../../../shared/model/common.model';
import { CustomerAnamnesisAnswersInputSchema } from '../../model/customer-anamnesis-answer-input.model';

export const CreateCustomerAnamnesisSchema = z.object({
  anamnesisFormId: z.string(),
  appointmentId: z.string().optional().nullable(),
  date: DatetimeParamSchema.optional(),
  answers: CustomerAnamnesisAnswersInputSchema.default([]),
});

export class CreateCustomerAnamnesisDto extends createZodDto(
  CreateCustomerAnamnesisSchema,
  { type: 'output' },
) {}

export const CreateCustomerAnamnesisRequestSchema = z.object({
  customerAnamnesis: CreateCustomerAnamnesisSchema,
});

export class CreateCustomerAnamnesisRequest extends createZodDto(
  CreateCustomerAnamnesisRequestSchema,
  { type: 'output' },
) {}
