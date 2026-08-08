import { Injectable } from '@nestjs/common';
import { and, eq, InferInsertModel } from 'drizzle-orm';
import { mainEntities } from '../main-entities';
import { Repository } from './repository';

@Injectable()
export class ConfigAdminRepository extends Repository {
  findFirstLatestVersionByGroupAndNameAndUserIdAndTenantId(
    group: string,
    name: string,
    userId: string,
    tenantId: string,
  ) {
    return this.db.query.config.findFirst({
      where: {
        group,
        name,
        userId,
        tenantId,
        isDeleted: false,
      },
      orderBy: {
        version: 'desc',
      },
    });
  }

  async inactivate(id: string) {
    await this.db
      .update(this.db.e.config)
      .set({ inactivatedAt: new Date() })
      .where(
        and(eq(this.db.e.config.id, id), eq(this.db.e.config.isDeleted, false)),
      );
  }

  insert(dto: Omit<InferInsertModel<typeof mainEntities.config>, 'id'>) {
    return this.db.insert(mainEntities.config).values(dto).returning();
  }
}
