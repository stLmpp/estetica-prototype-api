import { Injectable } from '@nestjs/common';
import { asc, eq, inArray, InferInsertModel } from 'drizzle-orm';
import { mainEntities } from '../main-entities';
import { FilterAnamnesisFieldDto } from '../../../features/anamnesis-field/dto/input/list-anamnesis-field.request';
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
        anamnesisSection: true,
      },
    });
  }

  findByAnamnesisFormId({
    anamnesisFormId,
    anamnesisSectionId,
    active,
  }: FilterAnamnesisFieldDto) {
    return this.db.query.anamnesisField.findMany({
      where: {
        anamnesisFormId,
        anamnesisSectionId,
        active,
      },
      with: {
        anamnesisFieldValidations: {
          where: { active: true },
        },
      },
      orderBy: (field) => [asc(field.displayOrder), asc(field.id)],
    });
  }
}
