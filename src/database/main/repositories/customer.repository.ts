import { Injectable } from '@nestjs/common';
import { and, eq, exists, ilike, InferInsertModel, sql } from 'drizzle-orm';
import { mainEntities } from '../main-entities';
import { MainDatasource } from '../main-database-connection';
import { FilterCustomerDto } from '../../../features/customer/dto/input/list-customer.request';
import { promiseAllObject } from '../../../shared/utils/promise-all-object';

@Injectable()
export class CustomerRepository {
  constructor(private readonly db: MainDatasource) {}

  async insert(
    entity: InferInsertModel<typeof mainEntities.customer>,
    phones: Array<
      Omit<InferInsertModel<typeof mainEntities.customerPhone>, 'customerId'>
    >,
  ) {
    return this.db.transaction(async (tx) => {
      const [inserted] = await tx
        .insert(this.db.e.customer)
        .values(entity)
        .returning();
      if (!phones.length) {
        return Object.assign(inserted, { phones: [] });
      }
      const insertedPhones = await tx
        .insert(this.db.e.customerPhone)
        .values(
          phones.map((phone) =>
            Object.assign(phone, { customerId: inserted.id }),
          ),
        )
        .returning();
      return Object.assign(inserted, { phones: insertedPhones });
    });
  }

  async update(
    id: number,
    entity: Partial<Omit<InferInsertModel<typeof mainEntities.customer>, 'id'>>,
  ) {
    await this.db
      .update(this.db.e.customer)
      .set(entity)
      .where(eq(this.db.e.customer.id, id));
  }

  async listPaginated({
    page,
    limit,
    name,
    birthDate,
    phone,
    email,
  }: FilterCustomerDto) {
    const offset = (page - 1) * limit;
    const phoneSubQuery = this.db
      .select({
        1: sql`1`,
      })
      .from(this.db.e.customerPhone)
      .where(
        and(
          eq(this.db.e.customer.id, this.db.e.customerPhone.customerId),
          eq(this.db.e.customerPhone.number, phone!).if(phone),
        ),
      );
    const where = and(
      ilike(this.db.e.customer.name, `%${name}%`).if(name),
      eq(this.db.e.customer.birthDate, birthDate!).if(birthDate),
      eq(this.db.e.customer.email, email!).if(email),
      exists(phoneSubQuery).if(phone),
    );
    const customers = this.db
      .select({
        id: this.db.e.customer.id,
        name: this.db.e.customer.name,
      })
      .from(this.db.e.customer)
      .where(where)
      .limit(limit)
      .offset(offset)
      .execute();
    const count = this.db
      .select({
        count: sql<number>`count(*)`.mapWith(Number),
      })
      .from(this.db.e.customer)
      .where(where)
      .execute()
      .then(([{ count }]) => count ?? 0);
    return promiseAllObject({ customers, count });
  }
}
