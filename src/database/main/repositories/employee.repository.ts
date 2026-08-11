import { Injectable } from '@nestjs/common';
import { and, eq, ilike, InferInsertModel, sql } from 'drizzle-orm';
import { mainEntities } from '../main-entities';
import { FilterEmployeeDto } from '../../../features/employee/dto/input/list-employee.request';
import { promiseAllObject } from '../../../shared/utils/promise-all-object';
import { Repository } from './repository';

@Injectable()
export class EmployeeRepository extends Repository {
  async insert(employee: InferInsertModel<typeof mainEntities.employee>) {
    const [entity] = await this.db
      .insert(this.db.e.employee)
      .values(employee)
      .returning();
    return entity!;
  }

  async update(
    id: string,
    {
      role,
    }: Partial<Omit<InferInsertModel<typeof mainEntities.employee>, 'id'>>,
  ) {
    if (!role) {
      return;
    }
    await this.db
      .update(this.db.e.employee)
      .set({ role })
      .where(and(eq(this.db.e.employee.id, id)));
  }

  async delete(id: string) {
    await this.db
      .update(this.db.e.employee)
      .set({ deletedAt: new Date() })
      .where(eq(this.db.e.employee.id, id));
  }

  async listPaginated({ page, limit, name, role }: FilterEmployeeDto) {
    const offset = (page - 1) * limit;
    const where = and(
      ilike(this.db.e.person.name, `%${name}%`).if(name),
      ilike(this.db.e.employee.role, `%${role}%`).if(role),
    );
    const employees = this.db
      .select({
        id: this.db.e.employee.id,
        name: this.db.e.person.name,
        role: this.db.e.employee.role,
      })
      .from(this.db.e.employee)
      .innerJoin(
        this.db.e.person,
        eq(this.db.e.employee.personId, this.db.e.person.id),
      )
      .where(where)
      .limit(limit)
      .offset(offset)
      .execute();
    const count = this.db
      .select({
        count: sql<number>`count(*)`.mapWith(Number),
      })
      .from(this.db.e.employee)
      .innerJoin(
        this.db.e.person,
        eq(this.db.e.employee.personId, this.db.e.person.id),
      )
      .where(where)
      .execute()
      .then((results) => results[0]?.count ?? 0);
    return promiseAllObject({ employees, count });
  }

  async getById(id: string) {
    return this.db.query.employee.findFirst({
      where: {
        id,
      },
    });
  }

  async getByIdWithPersonPersonPhones(id: string) {
    return this.db.query.employee
      .findFirst({
        where: {
          id,
        },
        columns: {
          id: true,
          role: true,
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
