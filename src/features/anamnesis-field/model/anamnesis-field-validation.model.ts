import { z } from 'zod';
import { AnamnesisFieldValidationType } from '../../../shared/domain/anamnesis-field-validation.enum';

const LengthArgsSchema = z.object({ length: z.int().positive() });
const ValueArgsSchema = z.object({ value: z.number() });
const PatternArgsSchema = z.object({
  pattern: z.string().trim().min(1).max(512),
});

export const AnamnesisFieldValidationArgsSchema = z.union([
  LengthArgsSchema,
  ValueArgsSchema,
  PatternArgsSchema,
]);

const VALIDATION_ARGS_KEY: Record<
  AnamnesisFieldValidationType,
  'length' | 'value' | 'pattern' | null
> = {
  [AnamnesisFieldValidationType.REQUIRED]: null,
  [AnamnesisFieldValidationType.MIN_LENGTH]: 'length',
  [AnamnesisFieldValidationType.MAX_LENGTH]: 'length',
  [AnamnesisFieldValidationType.MIN_VALUE]: 'value',
  [AnamnesisFieldValidationType.MAX_VALUE]: 'value',
  [AnamnesisFieldValidationType.PATTERN]: 'pattern',
};

export const AnamnesisFieldValidationInputSchema = z
  .object({
    validationType: z.enum(AnamnesisFieldValidationType),
    validationArgs: AnamnesisFieldValidationArgsSchema.optional().nullable(),
    active: z.boolean().default(true),
  })
  .refine(
    (data) => {
      const key = VALIDATION_ARGS_KEY[data.validationType];
      return !key || (!!data.validationArgs && key in data.validationArgs);
    },
    { message: 'validationArgs does not match validationType' },
  );

export type AnamnesisFieldValidationInput = z.input<
  typeof AnamnesisFieldValidationInputSchema
>;

export const AnamnesisFieldValidationListInputSchema = z
  .array(AnamnesisFieldValidationInputSchema)
  .refine(
    (validations) =>
      new Set(validations.map((v) => v.validationType)).size ===
      validations.length,
    { message: 'validationType must not repeat within the same field' },
  );

export const AnamnesisFieldValidationModelSchema = z.object({
  id: z.string(),
  validationType: z.enum(AnamnesisFieldValidationType),
  validationArgs: AnamnesisFieldValidationArgsSchema.optional(),
  active: z.boolean(),
});

export type AnamnesisFieldValidationModel = z.input<
  typeof AnamnesisFieldValidationModelSchema
>;
