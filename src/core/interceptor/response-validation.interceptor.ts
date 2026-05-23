import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, switchMap } from 'rxjs';
import { Reflector } from '@nestjs/core';
import {
  RESPONSE_TYPE_METADATA_KEY,
  ResponseTypeMetadata,
} from '../../shared/decorator/response-type.decorator';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { coreExceptions } from '../core-exceptions';
import { mapValidationErrorsToErrorDetails } from '../../shared/utils/map-validation-errors-to-error.details';

@Injectable()
export class ResponseValidationInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> | Promise<Observable<any>> {
    const metadata = this.getType(context);
    if (!metadata) {
      return next.handle();
    }
    return next.handle().pipe(
      switchMap(async (response) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const instance = plainToInstance(
          metadata.type,
          instanceToPlain(response),
        );
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const errors = await validate(instance, {
          whitelist: true,
          stopAtFirstError: false,
        });
        if (errors.length) {
          throw coreExceptions.invalidResponse(
            mapValidationErrorsToErrorDetails(errors),
          );
        }
        return instanceToPlain(instance);
      }),
    );
  }

  private getType(context: ExecutionContext): ResponseTypeMetadata | undefined {
    return this.reflector.getAllAndOverride(RESPONSE_TYPE_METADATA_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
  }
}
