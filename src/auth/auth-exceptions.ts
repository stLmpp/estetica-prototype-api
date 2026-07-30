import { exception } from '../core/exception/exception';

export const authExceptions = {
  tenantNotFound: exception({
    code: 'TENANT_NOT_FOUND',
    message: 'Tenant not found',
    status: 422,
  }),
  userNotFound: exception({
    code: 'USER_NOT_FOUND',
    message: 'User not found',
    status: 422,
  }),
} as const;
