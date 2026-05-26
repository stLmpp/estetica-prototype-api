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
import { MainDatasource } from '../main-database-connection';
import { FilterCustomerDto } from '../../../features/customer/dto/input/list-customer.request';
import { promiseAllObject } from '../../../shared/utils/promise-all-object';
import { isObjectEmpty } from '../../../shared/utils/is-object-empty';

@Injectable()
export class CustomerRepository {
  constructor(private readonly db: MainDatasource) {}

  async insert(
    entity: Omit<InferInsertModel<typeof mainEntities.customer>, 'personId'> & {
      person: InferInsertModel<typeof mainEntities.person>;
    },
    phones: Array<
      Omit<InferInsertModel<typeof mainEntities.personPhone>, 'personId'>
    >,
  ) {
    return this.db.transaction(async (tx) => {
      const [person] = await tx
        .insert(this.db.e.person)
        .values(entity.person)
        .returning();
      const [customer] = await tx
        .insert(this.db.e.customer)
        .values({ personId: person.id, jobName: entity.jobName })
        .returning();
      if (!phones.length) {
        return Object.assign(customer, { phones: [], person });
      }
      const insertedPhones = await tx
        .insert(this.db.e.personPhone)
        .values(
          phones.map((phone) => Object.assign(phone, { personId: person.id })),
        )
        .returning();
      return Object.assign(customer, { phones: insertedPhones, person });
    });
  }

  async update(
    id: number,
    {
      person,
      jobName,
    }: Partial<
      Omit<InferInsertModel<typeof mainEntities.customer>, 'id'> & {
        person: Partial<
          Omit<InferInsertModel<typeof mainEntities.person>, 'id'>
        >;
      }
    >,
  ) {
    await this.db.transaction(async (tx) => {
      const promises: Promise<unknown>[] = [];
      if (jobName) {
        promises.push(
          tx
            .update(this.db.e.customer)
            .set({ jobName })
            .where(
              and(
                eq(this.db.e.customer.id, id),
                isNull(this.db.e.customer.deletedAt),
              ),
            ),
        );
      }
      if (person && !isObjectEmpty(person)) {
        promises.push(
          tx
            .update(this.db.e.person)
            .set(person)
            .from(this.db.e.customer)
            .where(
              and(
                eq(this.db.e.customer.id, id),
                eq(this.db.e.customer.personId, this.db.e.person.id),
                isNull(this.db.e.customer.deletedAt),
                isNull(this.db.e.person.deletedAt),
              ),
            ),
        );
      }
      await Promise.all(promises);
    });
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
      isNull(this.db.e.person.deletedAt),
    );
    const customers = this.db
      .select({
        id: this.db.e.customer.id,
        name: this.db.e.person.name,
      })
      .from(this.db.e.customer)
      .innerJoin(
        this.db.e.person,
        eq(this.db.e.customer.personId, this.db.e.person.id),
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
      .then(([{ count }]) => count ?? 0);
    return promiseAllObject({ customers, count });
  }

  async getById(id: number) {
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
