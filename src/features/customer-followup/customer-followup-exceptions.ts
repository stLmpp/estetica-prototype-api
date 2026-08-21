import { exception } from '../../core/exception/exception';

export const CustomerFollowupExceptions = {
  customerFollowupNotFound: exception({
    code: 'CUSTOMER_FOLLOWUP_NOT_FOUND',
    message: 'Customer followup not found',
    status: 404,
  }),
  customerFollowupAppointmentMismatch: exception({
    code: 'CUSTOMER_FOLLOWUP_APPOINTMENT_MISMATCH',
    message: 'Appointment does not belong to the given customer',
    status: 422,
  }),
  customerFollowupSaleMismatch: exception({
    code: 'CUSTOMER_FOLLOWUP_SALE_MISMATCH',
    message: 'Sale does not belong to the given customer',
    status: 422,
  }),
  customerFollowupSaleAppointmentMismatch: exception({
    code: 'CUSTOMER_FOLLOWUP_SALE_APPOINTMENT_MISMATCH',
    message: 'Sale is not linked to the given appointment',
    status: 422,
  }),
} as const;
