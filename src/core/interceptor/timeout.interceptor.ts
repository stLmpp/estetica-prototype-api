import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import {
  catchError,
  Observable,
  throwError,
  timeout,
  TimeoutError,
} from 'rxjs';
import { AppEnv } from '../config/app-env';
import { coreExceptions } from '../core-exceptions';

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  constructor(private readonly appEnv: AppEnv) {}

  intercept(
    _: ExecutionContext,
    next: CallHandler,
  ): Observable<any> | Promise<Observable<any>> {
    return next.handle().pipe(
      timeout(this.appEnv.requestTimeoutMs),
      catchError((error: Error) => {
        if (error instanceof TimeoutError) {
          return throwError(() => coreExceptions.requestTimeout());
        }
        return throwError(() => error);
      }),
    );
  }
}
