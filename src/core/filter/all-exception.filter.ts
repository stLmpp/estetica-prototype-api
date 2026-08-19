import { ArgumentsHost, Catch, NotFoundException } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

import {
  ErrorDetailModel,
  ResponseErrorModel,
} from '../../shared/model/response-error.model';
import { z, ZodError } from 'zod';
import { coreExceptions } from '../core-exceptions';
import { LoggerService } from '../logger/logger.service';
import {
  ZodSchemaDeclarationException,
  ZodSerializationException,
  ZodValidationException,
} from '@stlmpp/nestjs-zod';
import { DrizzleQueryError } from 'drizzle-orm';
import { ThrottlerException } from '@nestjs/throttler';
import { isAPIError } from 'better-auth/api';
import { dynamicException } from '../exception/exception';
import { PostgresErrorCode } from './postgres-error-code.enum';

const NotFoundResponseSchema = z.object({
  message: z.string(),
  error: z.string().optional(),
  statusCode: z.number().optional(),
});

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  constructor(private readonly logger: LoggerService) {
    super();
    logger.setContext(AllExceptionsFilter.name);
  }

  catch(unknownException: unknown, host: ArgumentsHost) {
    const applicationRef =
      this.applicationRef ||
      (this.httpAdapterHost && this.httpAdapterHost.httpAdapter)!;

    if (unknownException instanceof ZodSerializationException) {
      const zodError = unknownException.getZodError();
      if (zodError instanceof ZodError) {
        unknownException = coreExceptions.invalidResponse(
          zodError.issues.map(
            (issue) =>
              new ErrorDetailModel(issue.message, issue.path.join('.')),
          ),
        );
      }
    }

    if (unknownException instanceof ZodValidationException) {
      const zodError = unknownException.getZodError();
      if (zodError instanceof ZodError) {
        unknownException = coreExceptions.invalidRequest(
          zodError.issues.map(
            (issue) =>
              new ErrorDetailModel(issue.message, issue.path.join('.')),
          ),
        );
      }
    }

    if (unknownException instanceof ZodSchemaDeclarationException) {
      unknownException = coreExceptions.missingZodDto(unknownException.message);
    }

    if (unknownException instanceof NotFoundException) {
      const details: ErrorDetailModel[] = [];
      const exceptionResponse = unknownException.getResponse();
      const responseParsed =
        NotFoundResponseSchema.safeParse(exceptionResponse);
      if (responseParsed.success) {
        const { message } = responseParsed.data;
        const route = message.replace(
          /^Cannot (?:GET|POST|PUT|DELETE|PATCH|OPTIONS|HEAD) /i,
          '',
        );
        details.push(new ErrorDetailModel(`Route ${route} not found`, 'route'));
      }
      unknownException = coreExceptions.routeNotFound(details);
    }

    if (unknownException instanceof DrizzleQueryError) {
      const cause = unknownException.cause;
      if (
        cause &&
        typeof cause === 'object' &&
        'code' in cause &&
        cause.code === PostgresErrorCode.UndefinedObject
      ) {
        unknownException = coreExceptions.databaseSessionNotSet([
          {
            field: '.',
            issue: unknownException.message,
          },
        ]);
      }
    }

    if (unknownException instanceof ThrottlerException) {
      unknownException = coreExceptions.tooManyRequests();
    }

    console.log({ unknownException });

    if (isAPIError(unknownException)) {
      unknownException = dynamicException({
        code: unknownException.body?.code ?? 'UNKNOWN_AUTH_ERROR',
        message: unknownException.body?.message ?? unknownException.message,
        status: unknownException.statusCode,
        error: unknownException.message,
      });
    }

    if (unknownException instanceof ResponseErrorModel) {
      const response: unknown = host.getArgByIndex(1);
      if (!applicationRef.isHeadersSent(response)) {
        applicationRef.reply(
          response,
          unknownException.toJSON(),
          unknownException.statusCode,
        );
      } else {
        applicationRef.end(response);
      }
      return;
    }

    this.logger.error('An unknown exception occurred', {
      clazz:
        unknownException &&
        typeof unknownException === 'object' &&
        'constructor' in unknownException &&
        unknownException.constructor.name,
      exception: unknownException,
      stack:
        unknownException instanceof Error ? unknownException.stack : undefined,
      message:
        unknownException instanceof Error
          ? unknownException.message
          : undefined,
      error: JSON.stringify(unknownException),
    });

    super.catch(unknownException, host);
  }
}
