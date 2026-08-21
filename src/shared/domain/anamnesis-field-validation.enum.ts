export enum AnamnesisFieldValidationType {
  REQUIRED = 'required',
  MIN_LENGTH = 'minLength',
  MAX_LENGTH = 'maxLength',
  MIN_VALUE = 'minValue',
  MAX_VALUE = 'maxValue',
  PATTERN = 'pattern',
  MIN_DATE = 'minDate',
  MAX_DATE = 'maxDate',
  DATE_IN_FUTURE = 'dateInFuture',
  DATE_IN_PAST = 'dateInPast',
  DATE_TODAY_OR_LATER = 'dateTodayOrLater',
  DATE_TODAY_OR_EARLIER = 'dateTodayOrEarlier',
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

export interface AnamnesisFieldValidationArgsDate {
  date: string;
}

export type AnamnesisFieldValidationArgs =
  | AnamnesisFieldValidationArgsLength
  | AnamnesisFieldValidationArgsValue
  | AnamnesisFieldValidationArgsPattern
  | AnamnesisFieldValidationArgsDate;
