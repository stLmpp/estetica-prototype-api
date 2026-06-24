import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { ClsService } from 'nestjs-cls';
import { Request } from 'express';
import { UserSession } from '@thallesp/nestjs-better-auth';
import { CLS_SESSION_KEY } from '../../auth/constants';

@Injectable()
export class SessionInterceptor implements NestInterceptor {
  constructor(private readonly clsService: ClsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const session = context
      .switchToHttp()
      .getRequest<Request & { session: UserSession }>().session;
    this.clsService.set(CLS_SESSION_KEY, session);
    return next.handle();
  }
}
