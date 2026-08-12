import { Injectable } from '@nestjs/common';
import {
  and,
  desc,
  eq,
  exists,
  ilike,
  InferInsertModel,
  sql,
} from 'drizzle-orm';
import { mainEntities } from '../main-entities';
import { FilterCatalogItemDto } from '../../../features/catalog-item/dto/input/list-catalog-item.request';
import { promiseAllObject } from '../../../shared/utils/promise-all-object';
import { Repository } from './repository';

type Insert = Omit<InferInsertModel<typeof mainEntities.catalogItem>, 'id'>;

@Injectable()
export class CatalogItemRepository extends Repository {
  async insert(catalogItem: Insert) {
    const [entity] = await this.db
      .insert(this.db.e.catalogItem)
      .values(catalogItem)
      .returning();
    return entity!;
  }

  async update(id: string, catalogItem: Partial<Insert>) {
    await this.db
      .update(this.db.e.catalogItem)
      .set(catalogItem)
      .where(eq(this.db.e.catalogItem.id, id));
  }

  async delete(id: string) {
    await this.db
      .update(this.db.e.catalogItem)
      .set({ deletedAt: new Date() })
      .where(eq(this.db.e.catalogItem.id, id));
  }

  findFirstById(id: string) {
    return this.db.query.catalogItem.findFirst({
      where: {
        id,
      },
    });
  }

  async findPaginated({
    page,
    limit,
    name,
    itemType,
    active,
    hasEmployees,
  }: FilterCatalogItemDto) {
    const offset = (page - 1) * limit;
    const employeeExistsQuery = this.db
      .select({ 1: sql`1` })
      .from(this.db.e.employeeService)
      .where(
        eq(this.db.e.employeeService.catalogItemId, this.db.e.catalogItem.id),
      );
    const where = and(
      ilike(this.db.e.catalogItem.name, `%${name}%`).if(name),
      eq(this.db.e.catalogItem.itemType, itemType!).if(itemType),
      eq(this.db.e.catalogItem.active, active!).if(active !== undefined),
      exists(employeeExistsQuery).if(hasEmployees),
    );
    const catalogItems = this.db
      .select()
      .from(this.db.e.catalogItem)
      .where(where)
      .orderBy(desc(this.db.e.catalogItem.id))
      .limit(limit)
      .offset(offset)
      .execute();
    const count = this.db
      .select({
        count: sql<number>`count(*)`.mapWith(Number),
      })
      .from(this.db.e.catalogItem)
      .where(where)
      .execute()
      .then((results) => results[0]?.count ?? 0);
    return promiseAllObject({ catalogItems, count });
  }
}
