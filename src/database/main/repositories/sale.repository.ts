import { Injectable } from '@nestjs/common';
import {
  and,
  desc,
  eq,
  gte,
  inArray,
  InferInsertModel,
  lte,
  sql,
} from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { mainEntities } from '../main-entities';
import { FilterSaleDto } from '../../../features/sale/dto/input/list-sale.request';
import { promiseAllObject } from '../../../shared/utils/promise-all-object';
import { isObjectEmpty } from '../../../shared/utils/is-object-empty';
import { Repository } from './repository';

type SaleInsert = Omit<InferInsertModel<typeof mainEntities.sale>, 'id'>;
type SaleItemInsert = Omit<
  InferInsertModel<typeof mainEntities.saleItem>,
  'id' | 'saleId'
>;
type SaleTransactionInsert = Omit<
  InferInsertModel<typeof mainEntities.saleTransaction>,
  'id' | 'saleId'
>;

@Injectable()
export class SaleRepository extends Repository {
  async insert(sale: SaleInsert) {
    const [entity] = await this.db
      .insert(this.db.e.sale)
      .values(sale)
      .returning();
    return entity!;
  }

  insertItems(saleId: string, items: SaleItemInsert[]) {
    if (!items.length) {
      return Promise.resolve([]);
    }
    return this.db
      .insert(this.db.e.saleItem)
      .values(items.map((item) => ({ ...item, saleId })))
      .returning();
  }

  insertTransactions(saleId: string, transactions: SaleTransactionInsert[]) {
    if (!transactions.length) {
      return Promise.resolve([]);
    }
    return this.db
      .insert(this.db.e.saleTransaction)
      .values(transactions.map((transaction) => ({ ...transaction, saleId })))
      .returning();
  }

  async insertTransaction(saleId: string, transaction: SaleTransactionInsert) {
    const [entity] = await this.db
      .insert(this.db.e.saleTransaction)
      .values({ ...transaction, saleId })
      .returning();
    return entity!;
  }

  findTransactionsBySaleId(saleId: string) {
    return this.db.query.saleTransaction.findMany({
      where: {
        saleId,
      },
    });
  }

  async update(id: string, patch: Partial<SaleInsert>) {
    if (isObjectEmpty(patch)) {
      return;
    }
    await this.db
      .update(this.db.e.sale)
      .set(patch)
      .where(eq(this.db.e.sale.id, id));
  }

  async delete(id: string) {
    await this.db
      .update(this.db.e.sale)
      .set({ deletedAt: new Date() })
      .where(eq(this.db.e.sale.id, id));
  }

  findFirstById(id: string) {
    return this.db.query.sale.findFirst({
      where: {
        id,
      },
    });
  }

  findFirstByAppointmentId(appointmentId: string) {
    return this.db.query.sale.findFirst({
      where: {
        appointmentId,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  findByAppointmentIds(appointmentIds: string[]) {
    if (!appointmentIds.length) {
      return Promise.resolve([]);
    }
    return (
      this.db
        .select({
          id: this.db.e.sale.id,
          appointmentId: this.db.e.sale.appointmentId,
        })
        .from(this.db.e.sale)
        .where(inArray(this.db.e.sale.appointmentId, appointmentIds))
        // Ascending so building a Map keyed by appointmentId below keeps the
        // most recent sale per appointment (last write wins) — appointmentId
        // isn't DB-unique, so more than one sale can exist for one appointment.
        .orderBy(this.db.e.sale.createdAt)
        .execute()
    );
  }

  findFirstByIdWithDetails(id: string) {
    return this.db.query.sale.findFirst({
      where: {
        id,
      },
      with: {
        customer: {
          columns: { id: true },
          with: { person: { columns: { name: true } } },
        },
        employee: {
          columns: { id: true },
          with: { person: { columns: { name: true } } },
        },
        saleItems: {
          with: { catalogItem: { columns: { name: true } } },
        },
        saleTransactions: true,
      },
    });
  }

  async findPaginated({
    page,
    limit,
    customerId,
    employeeId,
    appointmentId,
    status,
    from,
    to,
  }: FilterSaleDto) {
    const offset = (page - 1) * limit;
    const customerPerson = alias(this.db.e.person, 'sale_customer_person');
    const employeePerson = alias(this.db.e.person, 'sale_employee_person');
    const where = and(
      eq(this.db.e.sale.customerId, customerId!).if(customerId),
      eq(this.db.e.sale.employeeId, employeeId!).if(employeeId),
      eq(this.db.e.sale.appointmentId, appointmentId!).if(appointmentId),
      eq(this.db.e.sale.status, status!).if(status),
      gte(this.db.e.sale.createdAt, from!).if(from),
      lte(this.db.e.sale.createdAt, to!).if(to),
    );
    const columns = {
      id: this.db.e.sale.id,
      status: this.db.e.sale.status,
      totalAmount: this.db.e.sale.totalAmount,
      customerId: this.db.e.sale.customerId,
      customerName: customerPerson.name,
      employeeId: this.db.e.sale.employeeId,
      employeeName: employeePerson.name,
      appointmentId: this.db.e.sale.appointmentId,
      createdAt: this.db.e.sale.createdAt,
    };
    const sales = this.db
      .select(columns)
      .from(this.db.e.sale)
      .innerJoin(
        this.db.e.customer,
        eq(this.db.e.sale.customerId, this.db.e.customer.id),
      )
      .innerJoin(
        customerPerson,
        eq(this.db.e.customer.personId, customerPerson.id),
      )
      .innerJoin(
        this.db.e.employee,
        eq(this.db.e.sale.employeeId, this.db.e.employee.id),
      )
      .innerJoin(
        employeePerson,
        eq(this.db.e.employee.personId, employeePerson.id),
      )
      .where(where)
      .orderBy(desc(this.db.e.sale.createdAt))
      .limit(limit)
      .offset(offset)
      .execute();
    const count = this.db
      .select({
        count: sql<number>`count(*)`.mapWith(Number),
      })
      .from(this.db.e.sale)
      .where(where)
      .execute()
      .then((results) => results[0]?.count ?? 0);
    return promiseAllObject({ sales, count });
  }
}
