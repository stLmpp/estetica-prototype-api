import { Injectable } from '@nestjs/common';
import {
  and,
  asc,
  eq,
  exists,
  inArray,
  InferInsertModel,
  sql,
} from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { mainEntities } from '../main-entities';
import { FilterAnamnesisFieldDto } from '../../../features/anamnesis-field/dto/input/list-anamnesis-field.request';
import { promiseAllObject } from '../../../shared/utils/promise-all-object';
import { Repository } from './repository';

type Insert = Omit<InferInsertModel<typeof mainEntities.anamnesisField>, 'id'>;

@Injectable()
export class AnamnesisFieldRepository extends Repository {
  async insert(anamnesisField: Insert) {
    const [entity] = await this.db
      .insert(this.db.e.anamnesisField)
      .values(anamnesisField)
      .returning();
    return entity!;
  }

  async update(id: string, anamnesisField: Partial<Insert>) {
    await this.db
      .update(this.db.e.anamnesisField)
      .set(anamnesisField)
      .where(eq(this.db.e.anamnesisField.id, id));
  }

  async delete(id: string) {
    await this.db
      .update(this.db.e.anamnesisField)
      .set({ deletedAt: new Date() })
      .where(eq(this.db.e.anamnesisField.id, id));
  }

  findFirstById(id: string) {
    return this.db.query.anamnesisField.findFirst({
      where: { id },
    });
  }

  findFirstByIdWithValidations(id: string) {
    return this.db.query.anamnesisField.findFirst({
      where: { id },
      with: {
        anamnesisFieldValidations: true,
      },
    });
  }

  findManyByIds(ids: string[]) {
    if (!ids.length) {
      return Promise.resolve([]);
    }
    return this.db
      .select()
      .from(this.db.e.anamnesisField)
      .where(inArray(this.db.e.anamnesisField.id, ids))
      .execute();
  }

  findManyActiveByIdsWithActiveValidations(ids: string[]) {
    if (!ids.length) {
      return Promise.resolve([]);
    }
    return this.db.query.anamnesisField.findMany({
      where: {
        id: { in: ids },
        active: true,
      },
      with: {
        anamnesisFieldValidations: {
          where: { active: true },
        },
      },
    });
  }

  hasSuccessor(id: string) {
    return this.db.query.anamnesisField
      .findFirst({
        where: { previousVersionId: id },
        columns: { id: true },
      })
      .then((row) => !!row);
  }

  async findPaginated({
    page,
    limit,
    anamnesisFormId,
    anamnesisSectionId,
    active,
  }: FilterAnamnesisFieldDto) {
    const offset = (page - 1) * limit;
    const successor = alias(mainEntities.anamnesisField, 'successor');
    const successorExistsQuery = this.db
      .select({ 1: sql`1` })
      .from(successor)
      .where(eq(successor.previousVersionId, this.db.e.anamnesisField.id));
    const where = and(
      eq(this.db.e.anamnesisField.anamnesisFormId, anamnesisFormId),
      eq(this.db.e.anamnesisField.anamnesisSectionId, anamnesisSectionId!).if(
        anamnesisSectionId,
      ),
      eq(this.db.e.anamnesisField.active, active!).if(active !== undefined),
      sql`NOT ${exists(successorExistsQuery)}`,
    );
    const anamnesisFields = this.db
      .select()
      .from(this.db.e.anamnesisField)
      .where(where)
      .orderBy(
        asc(this.db.e.anamnesisField.displayOrder),
        asc(this.db.e.anamnesisField.id),
      )
      .limit(limit)
      .offset(offset)
      .execute();
    const count = this.db
      .select({
        count: sql<number>`count(*)`.mapWith(Number),
      })
      .from(this.db.e.anamnesisField)
      .where(where)
      .execute()
      .then((results) => results[0]?.count ?? 0);
    return promiseAllObject({ anamnesisFields, count });
  }
}
