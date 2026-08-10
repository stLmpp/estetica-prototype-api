import { AuthGuard as BaseAuthGuard } from '@thallesp/nestjs-better-auth';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { BetterAuthSession } from './auth';
import {
  CLS_SESSION_ORG_ROLE_KEY,
  CLS_SESSION_ROLE_KEY,
  CLS_TENANT_ID_KEY,
  CLS_USER_ID_KEY,
} from './constants';
import { Reflector } from '@nestjs/core';
import { AuthService } from './auth.service';
import { ClsService } from 'nestjs-cls';
import { fromNodeHeaders } from 'better-auth/node';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly baseAuthGuard: BaseAuthGuard,
    private readonly reflector: Reflector,
    private readonly authService: AuthService,
    private readonly clsService: ClsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const result = await this.baseAuthGuard.canActivate(context);

    if (!result) {
      return false;
    }

    const isAuthOptional = this.reflector.getAllAndOverride<boolean>(
      'OPTIONAL',
      [context.getHandler(), context.getClass()],
    );
    const request = context
      .switchToHttp()
      .getRequest<Request & { session: BetterAuthSession | undefined }>();
    if (request.path.startsWith('/v1/auth') || isAuthOptional) {
      return true;
    }
    const session = request.session;
    const tenantId = session?.session.activeOrganizationId;
    this.clsService.set(CLS_TENANT_ID_KEY, tenantId);
    this.clsService.set(CLS_USER_ID_KEY, session?.user.id);
    this.clsService.set(CLS_SESSION_ROLE_KEY, session?.user.role);

    if (session && tenantId) {
      const response = await this.authService.api
        .getActiveMemberRole({
          headers: fromNodeHeaders(request.headers),
        })
        .catch(() => null);
      this.clsService.set(CLS_SESSION_ORG_ROLE_KEY, response?.role);
    }

    return true;
  }
}
