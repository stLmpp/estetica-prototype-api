import { exception } from '../../core/exception/exception';

export const CustomerExceptions = {
  customerNotFound: exception({
    code: 'CUSTOMER_NOT_FOUND',
    message: 'Customer not found',
    status: 404,
  }),
  customerLimitExceeded: exception({
    code: 'CUSTOMER_LIMIT_EXCEEDED',
    message: 'Organization customer limit reached',
    status: 409,
  }),
} as const;
