import { exception } from '../../core/exception/exception';

export const EmployeeExceptions = {
  employeeNotFound: exception({
    code: 'EMPLOYEE_NOT_FOUND',
    message: 'Employee not found',
    status: 404,
  }),
} as const;
