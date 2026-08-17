import { Injectable } from '@nestjs/common';
import { and, asc, eq, ilike, InferInsertModel, sql } from 'drizzle-orm';
import { mainEntities } from '../main-entities';
import { FilterAnamnesisFormDto } from '../../../features/anamnesis-field/dto/input/list-anamnesis-form.request';
import { promiseAllObject } from '../../../shared/utils/promise-all-object';
import { Repository } from './repository';

type Insert = Omit<InferInsertModel<typeof mainEntities.anamnesisForm>, 'id'>;

@Injectable()
export class AnamnesisFormRepository extends Repository {
  async insert(anamnesisForm: Insert) {
    const [entity] = await this.db
      .insert(this.db.e.anamnesisForm)
      .values(anamnesisForm)
      .returning();
    return entity!;
  }

  async update(id: string, anamnesisForm: Partial<Insert>) {
    await this.db
      .update(this.db.e.anamnesisForm)
      .set(anamnesisForm)
      .where(eq(this.db.e.anamnesisForm.id, id));
  }

  async delete(id: string) {
    await this.db
      .update(this.db.e.anamnesisForm)
      .set({ deletedAt: new Date() })
      .where(eq(this.db.e.anamnesisForm.id, id));
  }

  findFirstById(id: string) {
    return this.db.query.anamnesisForm.findFirst({
      where: { id },
    });
  }

  async findPaginated({ page, limit, name, active }: FilterAnamnesisFormDto) {
    const offset = (page - 1) * limit;
    const where = and(
      ilike(this.db.e.anamnesisForm.name, `%${name}%`).if(name),
      eq(this.db.e.anamnesisForm.active, active!).if(active !== undefined),
    );
    const anamnesisForms = this.db
      .select()
      .from(this.db.e.anamnesisForm)
      .where(where)
      .orderBy(
        asc(this.db.e.anamnesisForm.displayOrder),
        asc(this.db.e.anamnesisForm.id),
      )
      .limit(limit)
      .offset(offset)
      .execute();
    const count = this.db
      .select({
        count: sql<number>`count(*)`.mapWith(Number),
      })
      .from(this.db.e.anamnesisForm)
      .where(where)
      .execute()
      .then((results) => results[0]?.count ?? 0);
    return promiseAllObject({ anamnesisForms, count });
  }
}
