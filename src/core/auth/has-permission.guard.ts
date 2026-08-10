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
  type HasPermissionOptionsV2,
} from './has-permission.decorator';

@Injectable()
export class HasPermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authDataService: AuthDataService,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const options = this.reflector.getAllAndOverride<
      HasPermissionOptionsV2 | undefined
    >('has-permission', [context.getHandler(), context.getClass()]);

    if (!options) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<Request & { session: BetterAuthSession | undefined }>();

    const session = request.session;
    if (!session) {
      throw coreExceptions.unauthorized();
    }

    const headers = fromNodeHeaders(request.headers);
    const allowed = await this.evaluate(options, session, headers);
    if (!allowed) {
      throw coreExceptions.forbidden();
    }

    return true;
  }

  private async evaluate(
    options: HasPermissionOptionsV2,
    session: BetterAuthSession,
    headers: Headers,
  ): Promise<boolean> {
    if (options.or) {
      const results = await Promise.all(
        options.or.map((check) => this.check(check, session, headers)),
      );
      return results.some(Boolean);
    }

    if (options.and) {
      const results = await Promise.all(
        options.and.map((check) => this.check(check, session, headers)),
      );
      return results.every(Boolean);
    }

    return this.check(options, session, headers);
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
