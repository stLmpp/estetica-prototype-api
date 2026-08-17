import { Injectable } from '@nestjs/common';
import { desc, eq, InferInsertModel, sql } from 'drizzle-orm';
import { mainEntities } from '../main-entities';
import { FilterCustomerAnamnesisDto } from '../../../features/customer-anamnesis/dto/input/list-customer-anamnesis.request';
import { promiseAllObject } from '../../../shared/utils/promise-all-object';
import { Repository } from './repository';

type Insert = Omit<
  InferInsertModel<typeof mainEntities.customerAnamnesis>,
  'id'
>;

@Injectable()
export class CustomerAnamnesisRepository extends Repository {
  async insert(customerAnamnesis: Insert) {
    const [entity] = await this.db
      .insert(this.db.e.customerAnamnesis)
      .values(customerAnamnesis)
      .returning();
    return entity!;
  }

  async update(id: string, customerAnamnesis: Partial<Insert>) {
    await this.db
      .update(this.db.e.customerAnamnesis)
      .set(customerAnamnesis)
      .where(eq(this.db.e.customerAnamnesis.id, id));
  }

  async delete(id: string) {
    await this.db
      .update(this.db.e.customerAnamnesis)
      .set({ deletedAt: new Date() })
      .where(eq(this.db.e.customerAnamnesis.id, id));
  }

  findFirstById(id: string) {
    return this.db.query.customerAnamnesis.findFirst({
      where: { id },
    });
  }

  async findPaginated(
    customerId: string,
    { page, limit }: FilterCustomerAnamnesisDto,
  ) {
    const offset = (page - 1) * limit;
    const where = eq(this.db.e.customerAnamnesis.customerId, customerId);
    const customerAnamnesisRecords = this.db
      .select()
      .from(this.db.e.customerAnamnesis)
      .where(where)
      .orderBy(desc(this.db.e.customerAnamnesis.date))
      .limit(limit)
      .offset(offset)
      .execute();
    const count = this.db
      .select({
        count: sql<number>`count(*)`.mapWith(Number),
      })
      .from(this.db.e.customerAnamnesis)
      .where(where)
      .execute()
      .then((results) => results[0]?.count ?? 0);
    return promiseAllObject({ customerAnamnesisRecords, count });
  }
}
