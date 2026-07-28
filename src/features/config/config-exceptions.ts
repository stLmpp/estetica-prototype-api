import { exception } from '../../core/exception/exception';

export const ConfigExceptions = {
  configNotFound: exception({
    code: 'CONFIG_NOT_FOUND',
    message: 'Config not found',
    status: 404,
  }),
} as const;
