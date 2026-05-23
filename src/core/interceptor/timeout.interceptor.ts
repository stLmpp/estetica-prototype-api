import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  RequestTimeoutException,
} from '@nestjs/common';
import {
  catchError,
  Observable,
  throwError,
  timeout,
  TimeoutError,
} from 'rxjs';
import { AppConfig } from '../../shared/config/app-config';

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  constructor(private readonly appConfig: AppConfig) {}

  intercept(
    _: ExecutionContext,
    next: CallHandler,
  ): Observable<any> | Promise<Observable<any>> {
    return next.handle().pipe(
      timeout(this.appConfig.requestTimeoutMs),
      catchError((error: Error) => {
        if (error instanceof TimeoutError) {
          return throwError(() => new RequestTimeoutException());
        }
        return throwError(() => error);
      }),
    );
  }
}
