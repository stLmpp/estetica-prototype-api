import { Injectable } from '@nestjs/common';
import { Repository } from './repository';
import { and, eq, InferInsertModel } from 'drizzle-orm';
import { mainEntities } from '../main-entities';

@Injectable()
export class ConfigRepository extends Repository {
  getLatestVersionByNameAndUserIdAndTenantId(
    name: string,
    userId: string,
    tenantId: string,
  ) {
    return this.db.query.config.findFirst({
      where: {
        name,
        userId,
        tenantId,
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
      .where(and(eq(this.db.e.config.id, id)));
  }

  insert(dto: Omit<InferInsertModel<typeof mainEntities.config>, 'id'>) {
    return this.db.insert(mainEntities.config).values(dto).returning();
  }
}
