import { exception } from '../../core/exception/exception';

export const SaleExceptions = {
  saleNotFound: exception({
    code: 'SALE_NOT_FOUND',
    message: 'Sale not found',
    status: 404,
  }),
  saleAppointmentNotCompleted: exception({
    code: 'SALE_APPOINTMENT_NOT_COMPLETED',
    message: 'A sale can only be created from a completed appointment',
    status: 409,
  }),
  saleInvalidStatusTransition: exception({
    code: 'SALE_INVALID_STATUS_TRANSITION',
    message: 'Sale status cannot be changed to the requested value',
    status: 409,
  }),
  saleTerminalStatus: exception({
    code: 'SALE_TERMINAL_STATUS',
    message: 'Cannot add a transaction to a sale in a terminal status',
    status: 409,
  }),
  saleRefundExceedsPaidAmount: exception({
    code: 'SALE_REFUND_EXCEEDS_PAID_AMOUNT',
    message: 'Refund amount cannot exceed the net amount already paid',
    status: 409,
  }),
} as const;
