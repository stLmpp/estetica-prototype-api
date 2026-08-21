import { Injectable } from '@nestjs/common';
import { desc, eq, InferInsertModel, sql } from 'drizzle-orm';
import { mainEntities } from '../main-entities';
import { FilterCustomerFollowupDto } from '../../../features/customer-followup/dto/input/list-customer-followup.request';
import { promiseAllObject } from '../../../shared/utils/promise-all-object';
import { isObjectEmpty } from '../../../shared/utils/is-object-empty';
import { Repository } from './repository';

type CustomerFollowupInsert = Omit<
  InferInsertModel<typeof mainEntities.customerFollowup>,
  'id'
>;
type FollowupItemInsert = Omit<
  InferInsertModel<typeof mainEntities.followupItem>,
  'id' | 'followupId'
>;

@Injectable()
export class CustomerFollowupRepository extends Repository {
  async insert(customerFollowup: CustomerFollowupInsert) {
    const [entity] = await this.db
      .insert(this.db.e.customerFollowup)
      .values(customerFollowup)
      .returning();
    return entity!;
  }

  insertItems(followupId: string, items: FollowupItemInsert[]) {
    if (!items.length) {
      return Promise.resolve([]);
    }
    return this.db
      .insert(this.db.e.followupItem)
      .values(items.map((item) => ({ ...item, followupId })))
      .returning();
  }

  async update(id: string, patch: Partial<CustomerFollowupInsert>) {
    if (isObjectEmpty(patch)) {
      return;
    }
    await this.db
      .update(this.db.e.customerFollowup)
      .set(patch)
      .where(eq(this.db.e.customerFollowup.id, id));
  }

  async delete(id: string) {
    await this.db
      .update(this.db.e.customerFollowup)
      .set({ deletedAt: new Date() })
      .where(eq(this.db.e.customerFollowup.id, id));
  }

  async deleteAllItemsByFollowupId(followupId: string) {
    await this.db
      .update(this.db.e.followupItem)
      .set({ deletedAt: new Date() })
      .where(eq(this.db.e.followupItem.followupId, followupId));
  }

  findFirstById(id: string) {
    return this.db.query.customerFollowup.findFirst({
      where: { id },
    });
  }

  findFirstByIdWithItems(id: string) {
    return this.db.query.customerFollowup.findFirst({
      where: { id },
      with: {
        followupItems: {
          with: { catalogItem: { columns: { name: true } } },
        },
      },
    });
  }

  async findPaginated(
    customerId: string,
    { page, limit }: FilterCustomerFollowupDto,
  ) {
    const offset = (page - 1) * limit;
    const where = eq(this.db.e.customerFollowup.customerId, customerId);
    const customerFollowups = this.db
      .select()
      .from(this.db.e.customerFollowup)
      .where(where)
      .orderBy(desc(this.db.e.customerFollowup.date))
      .limit(limit)
      .offset(offset)
      .execute();
    const count = this.db
      .select({
        count: sql<number>`count(*)`.mapWith(Number),
      })
      .from(this.db.e.customerFollowup)
      .where(where)
      .execute()
      .then((results) => results[0]?.count ?? 0);
    return promiseAllObject({ customerFollowups, count });
  }
}
