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
  appointmentInvalidStatusTransition: exception({
    code: 'APPOINTMENT_INVALID_STATUS_TRANSITION',
    message: 'Appointment status cannot be changed once it reaches a terminal status',
    status: 409,
  }),
  appointmentOutsideWorkingHours: exception({
    code: 'APPOINTMENT_OUTSIDE_WORKING_HOURS',
    message: 'Appointment time is outside the employee/organization working hours',
    status: 409,
  }),
} as const;
