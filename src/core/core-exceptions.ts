import { exception } from './exception/exception';

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
  unauthorized: exception({
    code: 'UNAUTHORIZED',
    status: 401,
    message: 'Unauthorized',
  }),
  databaseSessionNotSet: exception({
    code: 'DATABASE_SESSION_NOT_SET',
    status: 500,
    message: 'Database session not set',
    error:
      'Database session not set. Did you forgot to wrap into a transaction?',
  }),
  tooManyRequests: exception({
    code: 'TOO_MANY_REQUESTS',
    status: 429,
    message: 'Too many requests',
  }),
  forbidden: exception({
    code: 'FORBIDDEN',
    status: 403,
    message: 'Forbidden',
  }),
};
