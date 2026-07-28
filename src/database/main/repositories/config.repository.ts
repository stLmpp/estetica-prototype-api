import { Injectable } from '@nestjs/common';
import { Repository } from './repository';
import { and, desc, eq, InferInsertModel, isNull, sql } from 'drizzle-orm';
import { mainEntities } from '../main-entities';
import { FilterConfigDto } from '../../../features/config/dto/input/list-config.request';
import { promiseAllObject } from '../../../shared/utils/promise-all-object';

@Injectable()
export class ConfigRepository extends Repository {
  getLatestVersionByGroupAndNameAndUserIdAndTenantId(
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
      },
      orderBy: {
        version: 'desc',
      },
    });
  }

  async getFirstByGroupAndNameAndUserIdAndTenantIdAndVersion(
    group: string,
    name: string,
    userId: string,
    tenantId: string,
    version: number | 'latest',
  ) {
    const where = [
      eq(this.db.e.config.group, group),
      eq(this.db.e.config.name, name),
      eq(this.db.e.config.userId, userId),
      eq(this.db.e.config.tenantId, tenantId),
    ];
    if (version === 'latest') {
      where.push(isNull(this.db.e.config.inactivatedAt));
    } else {
      where.push(eq(this.db.e.config.version, version));
    }
    const [entity] = await this.db
      .select()
      .from(this.db.e.config)
      .where(and(...where))
      .limit(1);
    return entity;
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

  async listPaginated(dto: FilterConfigDto) {
    const where = and(
      eq(this.db.e.config.group, dto.group).if(dto.group),
      eq(this.db.e.config.name, dto.name!).if(dto.name),
      eq(this.db.e.config.tenantId, dto.tenantId).if(dto.tenantId),
      eq(this.db.e.config.userId, dto.userId).if(dto.userId),
      isNull(this.db.e.config.inactivatedAt).if(!dto.showInactivated),
      eq(this.db.e.config.version, dto.version!).if(dto.version),
    );
    const offset = (dto.page - 1) * dto.limit;
    const configs = this.db
      .select()
      .from(this.db.e.config)
      .where(where)
      .orderBy(desc(this.db.e.config.id))
      .limit(dto.limit)
      .offset(offset)
      .execute();
    const count = this.db
      .select({
        count: sql<number>`count(*)`.mapWith(Number),
      })
      .from(this.db.e.config)
      .where(where)
      .execute()
      .then((results) => results[0]?.count ?? 0);
    return promiseAllObject({ configs, count });
  }
}
