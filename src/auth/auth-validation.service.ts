import { Injectable } from '@nestjs/common';
import {
  CLS_SESSION_ROLE_KEY,
  CLS_TENANT_ID_KEY,
  CLS_USER_ID_KEY,
  GLOBAL_TENANT,
  GLOBAL_USER,
} from './constants';
import { ClsService } from 'nestjs-cls';
import { AuthRole } from './auth';
import { coreExceptions } from '../core/core-exceptions';

@Injectable()
export class AuthValidationService {
  constructor(private readonly clsService: ClsService) {}

  assertSessionHasAccess(tenantId: string, userId: string) {
    if (tenantId === GLOBAL_TENANT && userId === GLOBAL_USER) {
      return;
    }
    const role = this.clsService.get<AuthRole | undefined>(
      CLS_SESSION_ROLE_KEY,
    );
    if (!role) {
      throw coreExceptions.forbidden();
    }
    if (role === AuthRole.Admin) {
      return;
    }
    const sessionUserId = this.clsService.get<string>(CLS_USER_ID_KEY);
    const sessionTenantId = this.clsService.get<string>(CLS_TENANT_ID_KEY);
    const isUserIdAuthorized =
      sessionUserId === userId || userId === GLOBAL_USER;
    const isTenantIdAuthorized =
      sessionTenantId === tenantId || tenantId === GLOBAL_TENANT;
    if (isUserIdAuthorized && isTenantIdAuthorized) {
      return;
    }
    throw coreExceptions.forbidden();
  }
}
