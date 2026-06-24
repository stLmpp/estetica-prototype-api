import { Injectable } from '@nestjs/common';
import { Repository } from './repository';
import { and, eq, InferInsertModel, isNull } from 'drizzle-orm';
import { mainEntities } from '../main-entities';

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

  async update(id: number, anamnesisField: Partial<Insert>) {
    await this.db
      .update(this.db.e.anamnesisField)
      .set(anamnesisField)
      .where(
        and(
          eq(this.db.e.anamnesisField.id, id),
          isNull(this.db.e.anamnesisField.deletedAt),
        ),
      );
  }
}
