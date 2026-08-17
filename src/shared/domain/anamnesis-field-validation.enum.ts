export enum AnamnesisFieldValidationType {
  REQUIRED = 'required',
  MIN_LENGTH = 'minLength',
  MAX_LENGTH = 'maxLength',
  MIN_VALUE = 'minValue',
  MAX_VALUE = 'maxValue',
  PATTERN = 'pattern',
}

export interface AnamnesisFieldValidationArgsLength {
  length: number;
}

export interface AnamnesisFieldValidationArgsValue {
  value: number;
}

export interface AnamnesisFieldValidationArgsPattern {
  pattern: string;
}

export type AnamnesisFieldValidationArgs =
  | AnamnesisFieldValidationArgsLength
  | AnamnesisFieldValidationArgsValue
  | AnamnesisFieldValidationArgsPattern;
