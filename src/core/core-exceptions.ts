import { exception } from '../shared/exception/exception';

export const coreExceptions = {
  invalidBody: exception({
    code: 'INVALID_BODY',
    message: 'Invalid request body',
    status: 400,
  }),
  invalidQueryParameters: exception({
    code: 'INVALID_QUERY_PARAMETERS',
    message: 'Invalid query parameters',
    status: 400,
  }),
  invalidPathParameters: exception({
    code: 'INVALID_PATH_PARAMETERS',
    message: 'Invalid path parameters',
    status: 400,
  }),
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
};
