import { Injectable } from '@nestjs/common';
import { Repository } from './repository';
import { and, eq, InferInsertModel, isNull } from 'drizzle-orm';
import { mainEntities } from '../main-entities';
import { isObjectEmpty } from '../../../shared/utils/is-object-empty';

@Injectable()
export class PersonRepository extends Repository {
  async insert(person: InferInsertModel<typeof mainEntities.person>) {
    const [entity] = await this.db
      .insert(this.db.e.person)
      .values(person)
      .returning();
    return entity!;
  }

  async update(
    personId: number,
    person: Partial<Omit<InferInsertModel<typeof mainEntities.person>, 'id'>>,
  ) {
    if (isObjectEmpty(person)) {
      return;
    }
    await this.db
      .update(this.db.e.person)
      .set(person)
      .where(
        and(
          eq(this.db.e.person.id, personId),
          isNull(this.db.e.person.deletedAt),
        ),
      );
  }
}
