export enum AnamnesisFieldType {
  TEXT = 'TEXT',
  NUMBER = 'NUMBER',
  DATE = 'DATE',
  BOOLEAN = 'BOOLEAN',
  CHECKBOX = 'CHECKBOX',
  RADIO = 'RADIO',
  SELECT = 'SELECT',
}

export interface AnamnesisFieldOption {
  value: string;
  label: string;
}

export interface AnamnesisFieldArgs {
  options: AnamnesisFieldOption[];
}

export interface AnamnesisFieldExtraLabels {
  description?: string;
}
