import { Injectable } from '@nestjs/common';
import { AuthOrganizationRepository } from '../../database/main/repositories/auth-organization.repository';
import { AuthDataService } from './auth-data.service';
import { parseWorkingHours } from '../../shared/model/working-hours.model';
import { coreExceptions } from '../core-exceptions';

@Injectable()
export class OrganizationService {
  constructor(
    private readonly organizationRepository: AuthOrganizationRepository,
    private readonly authDataService: AuthDataService,
  ) {}

  getCurrentTenantId(): string {
    return this.authDataService.getTenantId();
  }

  async getCurrentOrganization() {
    const organization = await this.organizationRepository.findFirstById(
      this.getCurrentTenantId(),
    );
    if (!organization) {
      throw coreExceptions.organizationNotFound();
    }
    return {
      ...organization,
      workingHours: parseWorkingHours(organization.workingHours),
    };
  }
}
