import { Injectable } from '@nestjs/common';
import { and, asc, eq, exists, InferInsertModel, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
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

  /** Excludes superseded versions — only the current row per version chain. */
  findByAnamnesisFormId(anamnesisFormId: string) {
    const successor = alias(mainEntities.anamnesisSection, 'successor');
    const successorExistsQuery = this.db
      .select({ 1: sql`1` })
      .from(successor)
      .where(eq(successor.previousVersionId, this.db.e.anamnesisSection.id));
    return this.db
      .select()
      .from(this.db.e.anamnesisSection)
      .where(
        and(
          eq(this.db.e.anamnesisSection.anamnesisFormId, anamnesisFormId),
          sql`NOT ${exists(successorExistsQuery)}`,
        ),
      )
      .orderBy(
        asc(this.db.e.anamnesisSection.displayOrder),
        asc(this.db.e.anamnesisSection.id),
      )
      .execute();
  }

  hasSuccessor(id: string) {
    return this.db.query.anamnesisSection
      .findFirst({
        where: { previousVersionId: id },
        columns: { id: true },
      })
      .then((row) => !!row);
  }
}
