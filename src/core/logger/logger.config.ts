import path from 'node:path';
import { type Logger, type LoggerOptions, pino } from 'pino';
import { AppEnv } from '../config/app-env';
import { Environment } from '../../shared/environment.enum';

export const PINO_LOGGER = 'PINO_LOGGER';

export function createPinoLogger(appEnv: AppEnv): Logger {
  const logLevel = appEnv.logLevel;
  const logDir = path.join(process.cwd(), appEnv.logDir);
  const isProduction = appEnv.environment === Environment.Production;

  const options: LoggerOptions = {
    level: logLevel,
    timestamp: () => `,"time":"${new Date().toISOString()}"`,
    transport: {
      targets: [
        {
          target: 'pino-pretty',
          level: logLevel,
          options: {
            colorize: !isProduction,
            translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
            ignore: 'pid,hostname',
            messageKey: 'msg',
          },
        },
        {
          target: 'pino-roll',
          level: logLevel,
          options: {
            frequency: 'daily',
            dateFormat: 'yyyy.MM.dd',
            mkdir: true,
            file: path.join(logDir, 'app'),
          },
        },
      ],
    },
  };

  return pino(options);
}

export const pinoLogger = createPinoLogger(AppEnv.instance);
