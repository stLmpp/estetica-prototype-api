import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { ClsService } from 'nestjs-cls';
import { Request } from 'express';
import { CLS_TENANT_ID_KEY, CLS_USER_ID_KEY } from '../../auth/constants';
import { BetterAuthSession } from '../../auth/auth';
import { coreExceptions } from '../core-exceptions';
import { Reflector } from '@nestjs/core';

@Injectable()
export class SessionInterceptor implements NestInterceptor {
  constructor(
    private readonly clsService: ClsService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const isAuthOptional = this.reflector.getAllAndOverride<boolean>(
      'OPTIONAL',
      [context.getHandler(), context.getClass()],
    );
    const request = context
      .switchToHttp()
      .getRequest<Request & { session: BetterAuthSession | undefined }>();
    if (request.path.startsWith('/v1/auth') || isAuthOptional) {
      return next.handle();
    }
    const session = request.session;
    if (!session) {
      throw coreExceptions.unauthorized('Session not found in request');
    }
    const tenantId = session.session.activeOrganizationId;
    if (!tenantId) {
      throw coreExceptions.unauthorized('Tenant ID not found in session');
    }
    this.clsService.set(CLS_TENANT_ID_KEY, tenantId);
    this.clsService.set(CLS_USER_ID_KEY, session.user.id);
    return next.handle();
  }
}
