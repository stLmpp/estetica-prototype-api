import { exception } from '../../core/exception/exception';

export const CustomerAnamnesisExceptions = {
  customerAnamnesisNotFound: exception({
    code: 'CUSTOMER_ANAMNESIS_NOT_FOUND',
    message: 'Customer anamnesis record not found',
    status: 404,
  }),
  customerAnamnesisAppointmentMismatch: exception({
    code: 'CUSTOMER_ANAMNESIS_APPOINTMENT_MISMATCH',
    message: 'Appointment does not belong to the given customer',
    status: 422,
  }),
  customerAnamnesisAnswerInvalid: exception({
    code: 'CUSTOMER_ANAMNESIS_ANSWER_INVALID',
    message: 'One or more answers violate their field validation rules',
    status: 422,
  }),
  customerAnamnesisAlreadyFinalized: exception({
    code: 'CUSTOMER_ANAMNESIS_ALREADY_FINALIZED',
    message:
      'Customer anamnesis record is already finalized and can no longer be edited',
    status: 409,
  }),
} as const;
