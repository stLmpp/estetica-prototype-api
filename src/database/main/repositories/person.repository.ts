import { Injectable } from '@nestjs/common';
import { Repository } from './repository';
import { InferInsertModel } from 'drizzle-orm';
import { mainEntities } from '../main-entities';

@Injectable()
export class PersonRepository extends Repository {
  async insert(person: InferInsertModel<typeof mainEntities.person>) {
    const [entity] = await this.db
      .insert(this.db.e.person)
      .values(person)
      .returning();
    return entity!;
  }
}
