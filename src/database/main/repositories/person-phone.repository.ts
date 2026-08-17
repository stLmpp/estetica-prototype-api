import { Injectable } from '@nestjs/common';
import { inArray, InferInsertModel } from 'drizzle-orm';
import { mainEntities } from '../main-entities';
import { Repository } from './repository';

@Injectable()
export class PersonPhoneRepository extends Repository {
  async insertMany(
    phones: Array<InferInsertModel<typeof mainEntities.personPhone>>,
  ) {
    if (!phones.length) {
      return [];
    }
    return this.db.insert(this.db.e.personPhone).values(phones).returning();
  }

  findAllByPersonId(personId: string) {
    return this.db.query.personPhone.findMany({
      where: {
        personId,
      },
    });
  }

  async deleteMany(ids: string[]) {
    if (!ids.length) {
      return;
    }
    await this.db
      .update(this.db.e.personPhone)
      .set({ deletedAt: new Date() })
      .where(inArray(this.db.e.personPhone.id, ids));
  }
}
