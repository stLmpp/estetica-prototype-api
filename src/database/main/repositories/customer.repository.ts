import { Injectable } from '@nestjs/common';
import { eq, InferInsertModel } from 'drizzle-orm';
import { mainEntities } from '../main-entities';
import { MainDatasource } from '../main-database-connection';

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

  async listPaginated() {}
}
