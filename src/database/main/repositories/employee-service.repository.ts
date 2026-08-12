import { Injectable } from '@nestjs/common';
import { and, eq, sql } from 'drizzle-orm';
import { FilterEmployeeServiceDto } from '../../../features/employee-service/dto/input/list-employee-service.request';
import { promiseAllObject } from '../../../shared/utils/promise-all-object';
import { Repository } from './repository';

@Injectable()
export class EmployeeServiceRepository extends Repository {
  async insert(employeeId: string, catalogItemId: string) {
    const [entity] = await this.db
      .insert(this.db.e.employeeService)
      .values({ employeeId, catalogItemId })
      .returning();
    return entity!;
  }

  async delete(id: string) {
    await this.db
      .update(this.db.e.employeeService)
      .set({ deletedAt: new Date() })
      .where(eq(this.db.e.employeeService.id, id));
  }

  findFirstById(id: string) {
    return this.db.query.employeeService.findFirst({
      where: {
        id,
      },
    });
  }

  findFirstByEmployeeAndCatalogItem(employeeId: string, catalogItemId: string) {
    return this.db.query.employeeService.findFirst({
      where: {
        employeeId,
        catalogItemId,
      },
    });
  }

  async findPaginated({
    page,
    limit,
    employeeId,
    catalogItemId,
  }: FilterEmployeeServiceDto) {
    const offset = (page - 1) * limit;
    const where = and(
      eq(this.db.e.employeeService.employeeId, employeeId!).if(employeeId),
      eq(this.db.e.employeeService.catalogItemId, catalogItemId!).if(
        catalogItemId,
      ),
    );
    const employeeServices = this.db
      .select({
        id: this.db.e.employeeService.id,
        employeeId: this.db.e.employeeService.employeeId,
        employeeName: this.db.e.person.name,
        catalogItemId: this.db.e.employeeService.catalogItemId,
        catalogItemName: this.db.e.catalogItem.name,
      })
      .from(this.db.e.employeeService)
      .innerJoin(
        this.db.e.employee,
        eq(this.db.e.employeeService.employeeId, this.db.e.employee.id),
      )
      .innerJoin(
        this.db.e.person,
        eq(this.db.e.employee.personId, this.db.e.person.id),
      )
      .innerJoin(
        this.db.e.catalogItem,
        eq(this.db.e.employeeService.catalogItemId, this.db.e.catalogItem.id),
      )
      .where(where)
      .limit(limit)
      .offset(offset)
      .execute();
    const count = this.db
      .select({
        count: sql<number>`count(*)`.mapWith(Number),
      })
      .from(this.db.e.employeeService)
      .where(where)
      .execute()
      .then((results) => results[0]?.count ?? 0);
    return promiseAllObject({ employeeServices, count });
  }
}
