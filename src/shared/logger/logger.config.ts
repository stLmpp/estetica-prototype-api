import path from 'node:path';
import { type Logger, type LoggerOptions, pino } from 'pino';
import { AppConfig } from '../config/app-config';
import { Environment } from '../environment.enum';

export const PINO_LOGGER = 'PINO_LOGGER';

export function createPinoLogger(config: AppConfig): Logger {
  const logLevel = config.logLevel;
  const logDir = path.join(process.cwd(), config.logDir);
  const isProduction = config.environment === Environment.Production;

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

export const pinoLogger = createPinoLogger(AppConfig.instance);
