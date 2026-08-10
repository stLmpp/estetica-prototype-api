import { Injectable } from '@nestjs/common';
import { ClsService, ClsServiceManager } from 'nestjs-cls';
import {
  AuthOrgRole,
  AuthOrgSecurityLevel,
  AuthRole,
  AuthSecurityLevel,
  CLS_SESSION_ORG_ROLES_KEY,
  CLS_TENANT_ID_KEY,
  CLS_USER_ID_KEY,
} from './constants';

@Injectable()
export class AuthDataService {
  private constructor(private readonly clsService: ClsService) {}

  private readonly maxSecurityLevel = Math.max(
    ...Object.values(AuthSecurityLevel),
  );
  private readonly maxOrgSecurityLevel = Math.max(
    ...Object.values(AuthOrgSecurityLevel),
  );

  getTenantId() {
    return this.clsService.get<string>(CLS_TENANT_ID_KEY);
  }

  getUserId() {
    return this.clsService.get<string>(CLS_USER_ID_KEY);
  }

  getSessionRoles() {
    return (
      this.clsService.get<AuthRole[] | undefined>(CLS_SESSION_ORG_ROLES_KEY) ??
      []
    );
  }

  hasRole(role: AuthRole) {
    return this.getSessionRoles().includes(role);
  }

  getSessionOrgRoles() {
    return (
      this.clsService.get<AuthOrgRole[] | undefined>(
        CLS_SESSION_ORG_ROLES_KEY,
      ) ?? []
    );
  }

  hasOrgRole(role: AuthOrgRole) {
    return this.getSessionOrgRoles().includes(role);
  }

  getSessionSecurityLevel() {
    const roles = this.getSessionRoles();
    if (!roles.length) {
      return this.maxSecurityLevel + 1;
    }
    return Math.min(...roles.map((role) => AuthSecurityLevel[role]));
  }

  getOrgSessionSecurityLevel() {
    const orgRoles = this.getSessionOrgRoles();
    if (!orgRoles.length) {
      return this.maxOrgSecurityLevel + 1;
    }
    return Math.min(...orgRoles.map((role) => AuthOrgSecurityLevel[role]));
  }

  static readonly instance = new AuthDataService(
    ClsServiceManager.getClsService(),
  );
}
