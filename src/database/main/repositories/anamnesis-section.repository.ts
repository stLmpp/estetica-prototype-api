import { Injectable } from '@nestjs/common';
import { asc, eq, InferInsertModel } from 'drizzle-orm';
import { mainEntities } from '../main-entities';
import { Repository } from './repository';

type Insert = Omit<
  InferInsertModel<typeof mainEntities.anamnesisSection>,
  'id'
>;

@Injectable()
export class AnamnesisSectionRepository extends Repository {
  async insert(anamnesisSection: Insert) {
    const [entity] = await this.db
      .insert(this.db.e.anamnesisSection)
      .values(anamnesisSection)
      .returning();
    return entity!;
  }

  async update(id: string, anamnesisSection: Partial<Insert>) {
    await this.db
      .update(this.db.e.anamnesisSection)
      .set(anamnesisSection)
      .where(eq(this.db.e.anamnesisSection.id, id));
  }

  async delete(id: string) {
    await this.db
      .update(this.db.e.anamnesisSection)
      .set({ deletedAt: new Date() })
      .where(eq(this.db.e.anamnesisSection.id, id));
  }

  findFirstById(id: string) {
    return this.db.query.anamnesisSection.findFirst({
      where: { id },
    });
  }

  findByAnamnesisFormId(anamnesisFormId: string) {
    return this.db.query.anamnesisSection.findMany({
      where: {
        anamnesisFormId,
      },
      orderBy: (section) => [asc(section.displayOrder), asc(section.id)],
    });
  }
}
