import { z } from 'zod';
import { CustomerAnamnesisFieldExtraValuesSchema } from './customer-anamnesis-field.model';

export const CustomerAnamnesisAnswerInputSchema = z.object({
  anamnesisFieldId: z.string(),
  value: z.string().trim().max(2048).default(''),
  extraValues: CustomerAnamnesisFieldExtraValuesSchema.optional().nullable(),
});

export type CustomerAnamnesisAnswerInput = z.infer<
  typeof CustomerAnamnesisAnswerInputSchema
>;

export const CustomerAnamnesisAnswersInputSchema = z
  .array(CustomerAnamnesisAnswerInputSchema)
  .refine(
    (answers) =>
      new Set(answers.map((answer) => answer.anamnesisFieldId)).size ===
      answers.length,
    { message: 'anamnesisFieldId must not repeat within the same record' },
  );
