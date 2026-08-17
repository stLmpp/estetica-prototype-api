import { Injectable } from '@nestjs/common';
import { inArray, InferInsertModel } from 'drizzle-orm';
import { mainEntities } from '../main-entities';
import { Repository } from './repository';

type Insert = Omit<
  InferInsertModel<typeof mainEntities.anamnesisFieldValidation>,
  'id'
>;

@Injectable()
export class AnamnesisFieldValidationRepository extends Repository {
  async insertMany(validations: Insert[]) {
    if (!validations.length) {
      return [];
    }
    return this.db
      .insert(this.db.e.anamnesisFieldValidation)
      .values(validations)
      .returning();
  }

  findByAnamnesisFieldId(anamnesisFieldId: string) {
    return this.db.query.anamnesisFieldValidation.findMany({
      where: { anamnesisFieldId },
    });
  }

  findByAnamnesisFieldIds(anamnesisFieldIds: string[]) {
    if (!anamnesisFieldIds.length) {
      return Promise.resolve([]);
    }
    return this.db.query.anamnesisFieldValidation.findMany({
      where: { anamnesisFieldId: { in: anamnesisFieldIds } },
    });
  }

  async deleteMany(ids: string[]) {
    if (!ids.length) {
      return;
    }
    await this.db
      .update(this.db.e.anamnesisFieldValidation)
      .set({ deletedAt: new Date() })
      .where(inArray(this.db.e.anamnesisFieldValidation.id, ids));
  }
}
