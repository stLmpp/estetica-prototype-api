import { exception } from '../../shared/exception/exception';

export const CustomerExceptions = {
  customerNotFound: exception({
    code: 'CUSTOMER_NOT_FOUND',
    message: 'Customer not found',
    status: 404,
  }),
} as const;
