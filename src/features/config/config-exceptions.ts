import { exception } from '../../core/exception/exception';

export const ConfigExceptions = {
  configNotFound: exception({
    code: 'CONFIG_NOT_FOUND',
    message: 'Config not found',
    status: 404,
  }),
  valueNotParseable: exception({
    code: 'VALUE_NOT_PARSEABLE',
    message: 'Value is not parseable',
    status: 400,
  }),
} as const;
