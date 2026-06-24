import { Injectable } from '@nestjs/common';
import {
  and,
  eq,
  exists,
  ilike,
  InferInsertModel,
  isNull,
  sql,
} from 'drizzle-orm';
import { mainEntities } from '../main-entities';
import { FilterCustomerDto } from '../../../features/customer/dto/input/list-customer.request';
import { promiseAllObject } from '../../../shared/utils/promise-all-object';
import { Repository } from './repository';

@Injectable()
export class CustomerRepository extends Repository {
  async insert(customer: InferInsertModel<typeof mainEntities.customer>) {
    const [entity] = await this.db
      .insert(this.db.e.customer)
      .values(customer)
      .returning();
    return entity!;
  }

  async update(
    id: number,
    {
      jobName,
    }: Partial<Omit<InferInsertModel<typeof mainEntities.customer>, 'id'>>,
  ) {
    if (!jobName) {
      return;
    }
    await this.db
      .update(this.db.e.customer)
      .set({ jobName })
      .where(
        and(
          eq(this.db.e.customer.id, id),
          isNull(this.db.e.customer.deletedAt),
        ),
      );
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
      .from(this.db.e.personPhone)
      .where(
        and(
          eq(this.db.e.personPhone.personId, this.db.e.person.id),
          eq(this.db.e.personPhone.number, phone!).if(phone),
          isNull(this.db.e.personPhone.deletedAt),
          isNull(this.db.e.person.deletedAt),
          isNull(this.db.e.customer.deletedAt),
        ),
      );
    const where = and(
      ilike(this.db.e.person.name, `%${name}%`).if(name),
      eq(this.db.e.person.birthDate, birthDate!).if(birthDate),
      eq(this.db.e.person.email, email!).if(email),
      exists(phoneSubQuery).if(phone),
      isNull(this.db.e.customer.deletedAt),
    );
    const customers = this.db
      .select({
        id: this.db.e.customer.id,
        name: this.db.e.person.name,
      })
      .from(this.db.e.customer)
      .innerJoin(
        this.db.e.person,
        and(
          eq(this.db.e.customer.personId, this.db.e.person.id),
          isNull(this.db.e.person.deletedAt),
        ),
      )
      .where(where)
      .limit(limit)
      .offset(offset)
      .execute();
    const count = this.db
      .select({
        count: sql<number>`count(*)`.mapWith(Number),
      })
      .from(this.db.e.customer)
      .innerJoin(
        this.db.e.person,
        eq(this.db.e.customer.personId, this.db.e.person.id),
      )
      .where(where)
      .execute()
      .then((results) => results[0]?.count ?? 0);
    return promiseAllObject({ customers, count });
  }

  async getById(id: number) {
    return this.db.query.customer.findFirst({
      where: {
        id,
        deletedAt: {
          isNull: true,
        },
      },
    });
  }

  async getByIdWithPersonPersonPhones(id: number) {
    return this.db.query.customer
      .findFirst({
        where: {
          id,
          deletedAt: {
            isNull: true,
          },
        },
        columns: {
          id: true,
          jobName: true,
          personId: true,
        },
        with: {
          person: {
            columns: {
              id: true,
              name: true,
              birthDate: true,
              address: true,
              zipCode: true,
              neighborhood: true,
              city: true,
              state: true,
              maritalStatus: true,
              email: true,
            },
            with: {
              personPhones: {
                columns: {
                  id: true,
                  number: true,
                  customerId: true,
                  type: true,
                },
              },
            },
          },
        },
      })
      .execute();
  }
}
