import { Injectable } from '@nestjs/common';
import { InferInsertModel } from 'drizzle-orm';
import { mainEntities } from '../main-entities';
import { Repository } from './repository';

@Injectable()
export class CustomerPhoneRepository extends Repository {
  async insertMany(
    phones: Array<InferInsertModel<typeof mainEntities.personPhone>>,
  ) {
    if (!phones.length) {
      return [];
    }
    return this.db.insert(this.db.e.personPhone).values(phones).returning();
  }
}
