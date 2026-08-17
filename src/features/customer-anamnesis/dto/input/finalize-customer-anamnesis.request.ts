import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const FinalizeCustomerAnamnesisSchema = z.object({
  signedByName: z.string().trim().min(1).max(256),
});

export class FinalizeCustomerAnamnesisDto extends createZodDto(
  FinalizeCustomerAnamnesisSchema,
  { type: 'output' },
) {}

export const FinalizeCustomerAnamnesisRequestSchema = z.object({
  customerAnamnesis: FinalizeCustomerAnamnesisSchema,
});

export class FinalizeCustomerAnamnesisRequest extends createZodDto(
  FinalizeCustomerAnamnesisRequestSchema,
  { type: 'output' },
) {}
