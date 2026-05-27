import { exception } from '../shared/exception/exception';

export const coreExceptions = {
  invalidRequest: exception({
    code: 'INVALID_REQUEST',
    message: 'Invalid request',
    status: 400,
  }),
  invalidResponse: exception({
    code: 'INVALID_RESPONSE',
    message: 'Invalid response',
    status: 500,
  }),
  routeNotFound: exception({
    code: 'ROUTE_NOT_FOUND',
    status: 404,
    message: 'Route not found',
  }),
  missingZodDto: exception({
    code: 'MISSING_ZOD_DTO',
    status: 500,
    message: 'Missing Zod DTO schema declaration',
  }),
};
