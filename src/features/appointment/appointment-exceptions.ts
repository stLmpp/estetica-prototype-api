import { exception } from '../../core/exception/exception';

export const AppointmentExceptions = {
  appointmentNotFound: exception({
    code: 'APPOINTMENT_NOT_FOUND',
    message: 'Appointment not found',
    status: 404,
  }),
  appointmentConflict: exception({
    code: 'APPOINTMENT_CONFLICT',
    message: 'Employee already has an appointment in this time range',
    status: 409,
  }),
} as const;
