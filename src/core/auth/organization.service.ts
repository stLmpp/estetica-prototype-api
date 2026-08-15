import { Injectable } from '@nestjs/common';
import { AuthOrganizationRepository } from '../../database/main/repositories/auth-organization.repository';
import { AuthDataService } from './auth-data.service';
import {
  parseWorkingHours,
  type WeeklyWorkingHours,
} from '../../shared/model/working-hours.model';

@Injectable()
export class OrganizationService {
  constructor(
    private readonly organizationRepository: AuthOrganizationRepository,
    private readonly authDataService: AuthDataService,
  ) {}

  getCurrentTenantId(): string {
    return this.authDataService.getTenantId();
  }

  async getWorkingHours(tenantId: string): Promise<WeeklyWorkingHours | null> {
    const organization =
      await this.organizationRepository.findFirstByIdWithWorkingHours(tenantId);
    return parseWorkingHours(organization?.workingHours);
  }

  /**
   * Working hours of the organization from the current request's session —
   * lets feature services depend on "the current org's working hours"
   * without ever resolving a tenant id themselves.
   */
  getCurrentWorkingHours(): Promise<WeeklyWorkingHours | null> {
    return this.getWorkingHours(this.getCurrentTenantId());
  }
}
