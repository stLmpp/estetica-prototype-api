import { Injectable } from '@nestjs/common';
import { Repository } from './repository';

@Injectable()
export class AuthOrganizationRepository extends Repository {
  findFirstById(organizationId: string) {
    return this.db.query.authOrganization.findFirst({
      columns: {
        id: true,
      },
      where: {
        id: organizationId,
      },
    });
  }

  findFirstByIdWithCustomerLimit(organizationId: string) {
    return this.db.query.authOrganization.findFirst({
      columns: {
        id: true,
        customerLimit: true,
      },
      where: {
        id: organizationId,
      },
    });
  }

  findFirstByIdWithWorkingHours(organizationId: string) {
    return this.db.query.authOrganization.findFirst({
      columns: {
        id: true,
        workingHours: true,
      },
      where: {
        id: organizationId,
      },
    });
  }
}
