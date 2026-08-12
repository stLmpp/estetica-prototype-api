import { exception } from '../../core/exception/exception';

export const EmployeeServiceExceptions = {
  employeeServiceNotFound: exception({
    code: 'EMPLOYEE_SERVICE_NOT_FOUND',
    message: 'Employee service link not found',
    status: 404,
  }),
  employeeServiceAlreadyLinked: exception({
    code: 'EMPLOYEE_SERVICE_ALREADY_LINKED',
    message: 'Employee is already linked to this service',
    status: 409,
  }),
} as const;
