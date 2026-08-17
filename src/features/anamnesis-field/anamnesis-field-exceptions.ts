import { exception } from '../../core/exception/exception';

export const AnamnesisFieldExceptions = {
  anamnesisFormNotFound: exception({
    code: 'ANAMNESIS_FORM_NOT_FOUND',
    message: 'Anamnesis form not found',
    status: 404,
  }),
  anamnesisSectionNotFound: exception({
    code: 'ANAMNESIS_SECTION_NOT_FOUND',
    message: 'Anamnesis section not found',
    status: 404,
  }),
  anamnesisFieldNotFound: exception({
    code: 'ANAMNESIS_FIELD_NOT_FOUND',
    message: 'Anamnesis field not found',
    status: 404,
  }),
  anamnesisFieldInactiveReference: exception({
    code: 'ANAMNESIS_FIELD_INACTIVE_REFERENCE',
    message:
      'Anamnesis field is missing, inactive, or belongs to a different form',
    status: 422,
  }),
  anamnesisFieldSectionFormMismatch: exception({
    code: 'ANAMNESIS_FIELD_SECTION_FORM_MISMATCH',
    message:
      "Anamnesis section does not belong to the field's own anamnesis form",
    status: 422,
  }),
} as const;
