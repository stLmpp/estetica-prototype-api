import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { fromNodeHeaders } from 'better-auth/node';
import { AuthDataService } from './auth-data.service';
import { AuthService } from './auth.service';
import { BetterAuthSession } from './auth';
import { coreExceptions } from '../core-exceptions';
import {
  type BaseHasPermission,
  type NormalizedHasPermission,
} from './has-permission.decorator';

@Injectable()
export class HasPermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authDataService: AuthDataService,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const metadata = this.reflector.getAllAndOverride<
      NormalizedHasPermission | undefined
    >('has-permission', [context.getHandler(), context.getClass()]);

    if (!metadata) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<Request & { session: BetterAuthSession | undefined }>();

    const session = request.session;
    if (!session) {
      throw coreExceptions.unauthorized();
    }

    if (metadata.requiresActiveOrg && !session.session.activeOrganizationId) {
      throw coreExceptions.forbidden();
    }

    const headers = fromNodeHeaders(request.headers);
    const results = await Promise.all(
      metadata.checks.map((check) => this.check(check, session, headers)),
    );
    const allowed =
      metadata.mode === 'or' ? results.some(Boolean) : results.every(Boolean);

    if (!allowed) {
      throw coreExceptions.forbidden();
    }

    return true;
  }

  private async check(
    options: BaseHasPermission,
    session: BetterAuthSession,
    headers: Headers,
  ): Promise<boolean> {
    if (options.roles) {
      const role = this.authDataService.getSessionRole();
      return !!role && options.roles.includes(role);
    }

    if (options.orgRoles) {
      const orgRole = this.authDataService.getSessionOrgRole();
      return !!orgRole && options.orgRoles.includes(orgRole);
    }

    if (options.permissions) {
      const result = await this.authService.api
        .userHasPermission({
          body: {
            userId: session.user.id,
            permissions: options.permissions,
          },
        })
        .catch(() => null);
      return result?.success === true;
    }

    if (options.orgPermissions) {
      if (!session.session.activeOrganizationId) {
        return false;
      }
      const result = await this.authService.api
        .hasPermission({
          headers,
          body: { permissions: options.orgPermissions },
        })
        .catch(() => null);
      return result?.success === true;
    }

    return false;
  }
}
