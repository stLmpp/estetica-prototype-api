import { LoggerService } from './shared/logger/logger.service';
import { pinoLogger } from './shared/logger/logger.config';
import pg from 'pg';
import prettyMilliseconds from 'pretty-ms';

const logger = new LoggerService(pinoLogger, 'Database');

const originalSubmit = pg.Query.prototype.submit;
pg.Query.prototype.submit = function (...args) {
  const startTime = performance.now();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
  const text = (this as any).text;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
  const values = (this as any).values || [];

  this.once('end', () => {
    const duration = performance.now() - startTime;
    logger.debug(
      `query (${prettyMilliseconds(duration, { millisecondsDecimalDigits: 2 })}): ${text} --${JSON.stringify(values)}`,
    );
  });

  return originalSubmit.apply(this, args);
};
