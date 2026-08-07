import { Injectable } from '@nestjs/common';
import { ClsService, ClsServiceManager } from 'nestjs-cls';
import {
  AuthOrgRole,
  AuthOrgSecurityLevel,
  AuthRole,
  AuthSecurityLevel,
  CLS_SESSION_ORG_ROLE_KEY,
  CLS_SESSION_ROLE_KEY,
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

  getSessionRole() {
    return this.clsService.get<AuthRole | undefined>(CLS_SESSION_ROLE_KEY);
  }

  getSessionOrgRole() {
    return this.clsService.get<AuthOrgRole | undefined>(
      CLS_SESSION_ORG_ROLE_KEY,
    );
  }

  getSessionSecurityLevel() {
    const role = this.getSessionRole();
    return role ? AuthSecurityLevel[role] : this.maxSecurityLevel + 1;
  }

  getOrgSessionSecurityLevel() {
    const orgRole = this.getSessionOrgRole();
    return orgRole
      ? AuthOrgSecurityLevel[orgRole]
      : this.maxOrgSecurityLevel + 1;
  }

  static readonly instance = new AuthDataService(
    ClsServiceManager.getClsService(),
  );
}
