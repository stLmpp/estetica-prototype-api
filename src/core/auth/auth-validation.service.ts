import { Injectable } from '@nestjs/common';
import { AuthRole, GLOBAL_TENANT, GLOBAL_USER } from './constants';
import { coreExceptions } from '../core-exceptions';
import { authExceptions } from './auth-exceptions';
import { AuthOrganizationRepository } from '../../database/main/repositories/auth-organization.repository';
import { AuthUserRepository } from '../../database/main/repositories/auth-user.repository';
import { AuthDataService } from './auth-data.service';

@Injectable()
export class AuthValidationService {
  constructor(
    private readonly authOrganizationRepository: AuthOrganizationRepository,
    private readonly authUserRepository: AuthUserRepository,
    private readonly authDataService: AuthDataService,
  ) {}

  assertSessionHasAccess(tenantId: string, userId: string) {
    if (tenantId === GLOBAL_TENANT && userId === GLOBAL_USER) {
      return;
    }
    if (this.authDataService.hasRole(AuthRole.Admin)) {
      return;
    }
    const sessionUserId = this.authDataService.getUserId();
    const sessionTenantId = this.authDataService.getTenantId();
    const isUserIdAuthorized =
      sessionUserId === userId || userId === GLOBAL_USER;
    const isTenantIdAuthorized =
      sessionTenantId === tenantId || tenantId === GLOBAL_TENANT;
    if (isUserIdAuthorized && isTenantIdAuthorized) {
      return;
    }
    throw coreExceptions.forbidden();
  }

  async assertTenantExists(tenantId: string) {
    if (tenantId === GLOBAL_TENANT) {
      return;
    }
    const org = await this.authOrganizationRepository.findFirstById(tenantId);
    if (!org) {
      throw authExceptions.tenantNotFound();
    }
  }

  async assertUserExists(userId: string) {
    if (userId === GLOBAL_USER) {
      return;
    }
    const user = await this.authUserRepository.findFirstById(userId);
    if (!user) {
      throw authExceptions.userNotFound();
    }
  }
}
