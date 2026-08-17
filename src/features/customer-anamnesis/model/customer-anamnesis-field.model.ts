import { z } from 'zod';
import { AnamnesisFieldType } from '../../../shared/domain/anamnesis-field.type';

const AnamnesisFieldOptionSchema = z.object({
  value: z.string(),
  label: z.string(),
});

export const CustomerAnamnesisFieldExtraValuesSchema = z.object({
  values: z.array(z.string()),
});

export const CustomerAnamnesisFieldModelSchema = z.object({
  id: z.string(),
  anamnesisFieldId: z.string(),
  value: z.string(),
  extraValues: CustomerAnamnesisFieldExtraValuesSchema.optional(),
  anamnesisFieldLabel: z.string().optional(),
  anamnesisFieldType: z.enum(AnamnesisFieldType).optional(),
  anamnesisFieldOptions: z.array(AnamnesisFieldOptionSchema).optional(),
  anamnesisSectionId: z.string().optional(),
  anamnesisSectionLabel: z.string().optional(),
});

export type CustomerAnamnesisFieldModel = z.input<
  typeof CustomerAnamnesisFieldModelSchema
>;
