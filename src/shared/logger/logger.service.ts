import { ConsoleLogger, Inject, Injectable, Scope } from '@nestjs/common';
import type { Logger as PinoLogger } from 'pino';
import { PINO_LOGGER } from './logger.config';

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService extends ConsoleLogger {
  private logger: PinoLogger;

  constructor(@Inject(PINO_LOGGER) rootLogger: PinoLogger, context?: string) {
    super(context ?? '');
    this.logger = rootLogger.child({ context: context || undefined });
  }

  override setContext(context: string): void {
    super.setContext(context);
    this.logger = this.logger.child({ context });
  }

  info(
    message: unknown,
    metaOrContext?: Record<string, unknown> | string,
    context?: string,
  ): void {
    this.log(message, metaOrContext, context);
  }

  override log(message: unknown, context?: string): void;
  log(message: unknown, meta?: Record<string, unknown>, context?: string): void;
  log(
    message: unknown,
    metaOrContext?: Record<string, unknown> | string,
    context?: string,
  ): void;
  override log(
    message: unknown,
    metaOrContext?: Record<string, unknown> | string,
    context?: string,
  ): void {
    const [meta, ctx] = this.resolveMeta(metaOrContext, context);
    this.withContext(ctx).info(meta, String(message));
  }

  override error(message: unknown, stack?: string, context?: string): void;
  error(
    message: unknown,
    meta?: Record<string, unknown>,
    context?: string,
  ): void;
  override error(
    message: unknown,
    metaOrStack?: Record<string, unknown> | string,
    context?: string,
  ): void {
    const [meta, ctx] = this.resolveMeta(metaOrStack, context);
    this.withContext(ctx).error(meta, String(message));
  }

  override warn(message: unknown, context?: string): void;
  warn(
    message: unknown,
    meta?: Record<string, unknown>,
    context?: string,
  ): void;
  override warn(
    message: unknown,
    metaOrContext?: Record<string, unknown> | string,
    context?: string,
  ): void {
    const [meta, ctx] = this.resolveMeta(metaOrContext, context);
    this.withContext(ctx).warn(meta, String(message));
  }

  override debug(message: unknown, context?: string): void;
  debug(
    message: unknown,
    meta?: Record<string, unknown>,
    context?: string,
  ): void;
  override debug(
    message: unknown,
    metaOrContext?: Record<string, unknown> | string,
    context?: string,
  ): void {
    const [meta, ctx] = this.resolveMeta(metaOrContext, context);
    this.withContext(ctx).debug(meta, String(message));
  }

  private resolveMeta(
    metaOrContext: Record<string, unknown> | string | undefined,
    context: string | undefined,
  ): [Record<string, unknown>, string | undefined] {
    if (typeof metaOrContext === 'object' && metaOrContext !== null) {
      return [metaOrContext, context];
    }
    return [{}, metaOrContext ?? context];
  }

  private withContext(context?: string): PinoLogger {
    return context ? this.logger.child({ context }) : this.logger;
  }
}
