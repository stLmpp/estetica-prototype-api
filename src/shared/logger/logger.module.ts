import { Global, Module } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { PINO_LOGGER, pinoLogger } from './logger.config';

@Module({
  providers: [
    {
      provide: PINO_LOGGER,
      useValue: pinoLogger,
    },
    LoggerService,
  ],
  exports: [LoggerService],
})
@Global()
export class LoggerModule {}
