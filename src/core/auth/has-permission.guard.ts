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
import { AuthRole } from './constants';

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

    if (
      !metadata.withoutImplicitAdminAccess &&
      this.authDataService.hasRole(AuthRole.Admin)
    ) {
      return true;
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
      return options.roles.some((role) => this.authDataService.hasRole(role));
    }

    if (options.orgRoles) {
      return options.orgRoles.some((role) =>
        this.authDataService.hasOrgRole(role),
      );
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
