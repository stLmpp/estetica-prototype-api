import { Injectable } from '@nestjs/common';
import { and, eq, gt, InferInsertModel, lt, ne, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { mainEntities } from '../main-entities';
import { FilterAppointmentDto } from '../../../features/appointment/dto/input/list-appointment.request';
import { AppointmentStatus } from '../../../shared/domain/appointment-staus.enum';
import { promiseAllObject } from '../../../shared/utils/promise-all-object';
import { isObjectEmpty } from '../../../shared/utils/is-object-empty';
import { Repository } from './repository';

type Insert = Omit<InferInsertModel<typeof mainEntities.appointment>, 'id'>;

@Injectable()
export class AppointmentRepository extends Repository {
  async insert(appointment: Insert) {
    const [entity] = await this.db
      .insert(this.db.e.appointment)
      .values(appointment)
      .returning();
    return entity!;
  }

  async insertItem(
    appointmentId: string,
    catalogItemId: string,
    priceApplied: string,
  ) {
    const [entity] = await this.db
      .insert(this.db.e.appointmentItem)
      .values({ appointmentId, catalogItemId, priceApplied, quantity: 1 })
      .returning();
    return entity!;
  }

  async update(
    id: string,
    patch: Partial<
      Omit<InferInsertModel<typeof mainEntities.appointment>, 'id'>
    >,
  ) {
    if (isObjectEmpty(patch)) {
      return;
    }
    await this.db
      .update(this.db.e.appointment)
      .set(patch)
      .where(eq(this.db.e.appointment.id, id));
  }

  async delete(id: string) {
    await this.db
      .update(this.db.e.appointment)
      .set({ deletedAt: new Date() })
      .where(eq(this.db.e.appointment.id, id));
  }

  findFirstById(id: string) {
    return this.db.query.appointment.findFirst({
      where: {
        id,
      },
    });
  }

  async findFirstByIdWithCustomerAndEmployeeAndCatalogItem(id: string) {
    const { customerPerson, employeePerson, ...columns } = this.detailColumns();
    const [result] = await this.db
      .select(columns)
      .from(this.db.e.appointment)
      .innerJoin(
        this.db.e.customer,
        eq(this.db.e.appointment.customerId, this.db.e.customer.id),
      )
      .innerJoin(
        customerPerson,
        eq(this.db.e.customer.personId, customerPerson.id),
      )
      .innerJoin(
        this.db.e.employee,
        eq(this.db.e.appointment.employeeId, this.db.e.employee.id),
      )
      .innerJoin(
        employeePerson,
        eq(this.db.e.employee.personId, employeePerson.id),
      )
      .innerJoin(
        this.db.e.appointmentItem,
        eq(this.db.e.appointmentItem.appointmentId, this.db.e.appointment.id),
      )
      .innerJoin(
        this.db.e.catalogItem,
        eq(this.db.e.appointmentItem.catalogItemId, this.db.e.catalogItem.id),
      )
      .where(eq(this.db.e.appointment.id, id))
      .execute();
    return result;
  }

  async findPaginated({
    page,
    limit,
    customerId,
    employeeId,
    catalogItemId,
    status,
    from,
    to,
  }: FilterAppointmentDto) {
    const offset = (page - 1) * limit;
    const { customerPerson, employeePerson, ...columns } = this.detailColumns();
    const where = and(
      eq(this.db.e.appointment.customerId, customerId!).if(customerId),
      eq(this.db.e.appointment.employeeId, employeeId!).if(employeeId),
      eq(this.db.e.appointmentItem.catalogItemId, catalogItemId!).if(
        catalogItemId,
      ),
      eq(this.db.e.appointment.status, status!).if(status),
      lt(this.db.e.appointment.startTime, to!).if(to),
      gt(this.db.e.appointment.endTime, from!).if(from),
    );
    const appointments = this.db
      .select(columns)
      .from(this.db.e.appointment)
      .innerJoin(
        this.db.e.customer,
        eq(this.db.e.appointment.customerId, this.db.e.customer.id),
      )
      .innerJoin(
        customerPerson,
        eq(this.db.e.customer.personId, customerPerson.id),
      )
      .innerJoin(
        this.db.e.employee,
        eq(this.db.e.appointment.employeeId, this.db.e.employee.id),
      )
      .innerJoin(
        employeePerson,
        eq(this.db.e.employee.personId, employeePerson.id),
      )
      .innerJoin(
        this.db.e.appointmentItem,
        eq(this.db.e.appointmentItem.appointmentId, this.db.e.appointment.id),
      )
      .innerJoin(
        this.db.e.catalogItem,
        eq(this.db.e.appointmentItem.catalogItemId, this.db.e.catalogItem.id),
      )
      .where(where)
      .orderBy(this.db.e.appointment.startTime)
      .limit(limit)
      .offset(offset)
      .execute();
    const count = this.db
      .select({
        count: sql<number>`count(*)`.mapWith(Number),
      })
      .from(this.db.e.appointment)
      .innerJoin(
        this.db.e.appointmentItem,
        eq(this.db.e.appointmentItem.appointmentId, this.db.e.appointment.id),
      )
      .where(where)
      .execute()
      .then((results) => results[0]?.count ?? 0);
    return promiseAllObject({ appointments, count });
  }

  async findManyForDaySchedule(employeeId: string, from: Date, to: Date) {
    const customerPerson = alias(this.db.e.person, 'day_schedule_customer_person');
    return this.db
      .select({
        id: this.db.e.appointment.id,
        startTime: this.db.e.appointment.startTime,
        endTime: this.db.e.appointment.endTime,
        customerName: customerPerson.name,
        catalogItemName: this.db.e.catalogItem.name,
      })
      .from(this.db.e.appointment)
      .innerJoin(
        this.db.e.customer,
        eq(this.db.e.appointment.customerId, this.db.e.customer.id),
      )
      .innerJoin(
        customerPerson,
        eq(this.db.e.customer.personId, customerPerson.id),
      )
      .innerJoin(
        this.db.e.appointmentItem,
        eq(this.db.e.appointmentItem.appointmentId, this.db.e.appointment.id),
      )
      .innerJoin(
        this.db.e.catalogItem,
        eq(this.db.e.appointmentItem.catalogItemId, this.db.e.catalogItem.id),
      )
      .where(
        and(
          eq(this.db.e.appointment.employeeId, employeeId),
          ne(this.db.e.appointment.status, AppointmentStatus.CANCELLED),
          lt(this.db.e.appointment.startTime, to),
          gt(this.db.e.appointment.endTime, from),
        ),
      )
      .orderBy(this.db.e.appointment.startTime)
      .execute();
  }

  async findManyForCalendarRange(from: Date, to: Date, employeeId?: string) {
    const customerPerson = alias(this.db.e.person, 'calendar_customer_person');
    const employeePerson = alias(this.db.e.person, 'calendar_employee_person');
    return this.db
      .select({
        id: this.db.e.appointment.id,
        status: this.db.e.appointment.status,
        startTime: this.db.e.appointment.startTime,
        endTime: this.db.e.appointment.endTime,
        customerName: customerPerson.name,
        employeeName: employeePerson.name,
        catalogItemName: this.db.e.catalogItem.name,
      })
      .from(this.db.e.appointment)
      .innerJoin(
        this.db.e.customer,
        eq(this.db.e.appointment.customerId, this.db.e.customer.id),
      )
      .innerJoin(
        customerPerson,
        eq(this.db.e.customer.personId, customerPerson.id),
      )
      .innerJoin(
        this.db.e.employee,
        eq(this.db.e.appointment.employeeId, this.db.e.employee.id),
      )
      .innerJoin(
        employeePerson,
        eq(this.db.e.employee.personId, employeePerson.id),
      )
      .innerJoin(
        this.db.e.appointmentItem,
        eq(this.db.e.appointmentItem.appointmentId, this.db.e.appointment.id),
      )
      .innerJoin(
        this.db.e.catalogItem,
        eq(this.db.e.appointmentItem.catalogItemId, this.db.e.catalogItem.id),
      )
      .where(
        and(
          eq(this.db.e.appointment.employeeId, employeeId!).if(employeeId),
          lt(this.db.e.appointment.startTime, to),
          gt(this.db.e.appointment.endTime, from),
        ),
      )
      .orderBy(this.db.e.appointment.startTime)
      .execute();
  }

  async hasConflict(
    employeeId: string,
    startTime: Date,
    endTime: Date,
    excludeAppointmentId?: string,
  ) {
    const [conflict] = await this.db
      .select({ id: this.db.e.appointment.id })
      .from(this.db.e.appointment)
      .where(
        and(
          eq(this.db.e.appointment.employeeId, employeeId),
          ne(this.db.e.appointment.status, AppointmentStatus.CANCELLED),
          lt(this.db.e.appointment.startTime, endTime),
          gt(this.db.e.appointment.endTime, startTime),
          ne(this.db.e.appointment.id, excludeAppointmentId!).if(
            excludeAppointmentId,
          ),
        ),
      )
      .limit(1)
      .execute();
    return !!conflict;
  }

  private detailColumns() {
    const customerPerson = alias(this.db.e.person, 'customer_person');
    const employeePerson = alias(this.db.e.person, 'employee_person');
    return {
      customerPerson,
      employeePerson,
      id: this.db.e.appointment.id,
      status: this.db.e.appointment.status,
      startTime: this.db.e.appointment.startTime,
      endTime: this.db.e.appointment.endTime,
      notes: this.db.e.appointment.notes,
      customerId: this.db.e.appointment.customerId,
      customerName: customerPerson.name,
      employeeId: this.db.e.appointment.employeeId,
      employeeName: employeePerson.name,
      catalogItemId: this.db.e.appointmentItem.catalogItemId,
      catalogItemName: this.db.e.catalogItem.name,
      priceApplied: this.db.e.appointmentItem.priceApplied,
    };
  }
}
