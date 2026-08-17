import { Injectable } from '@nestjs/common';
import { eq, InferInsertModel } from 'drizzle-orm';
import { mainEntities } from '../main-entities';
import { Repository } from './repository';

type Insert = Omit<
  InferInsertModel<typeof mainEntities.customerAnamnesisField>,
  'id'
>;

@Injectable()
export class CustomerAnamnesisFieldRepository extends Repository {
  async insertMany(fields: Insert[]) {
    if (!fields.length) {
      return [];
    }
    return this.db
      .insert(this.db.e.customerAnamnesisField)
      .values(fields)
      .returning();
  }

  findByCustomerAnamnesisId(customerAnamnesisId: string) {
    return this.db.query.customerAnamnesisField.findMany({
      where: { customerAnamnesisId },
    });
  }

  async deleteAllByCustomerAnamnesisId(customerAnamnesisId: string) {
    await this.db
      .update(this.db.e.customerAnamnesisField)
      .set({ deletedAt: new Date() })
      .where(
        eq(
          this.db.e.customerAnamnesisField.customerAnamnesisId,
          customerAnamnesisId,
        ),
      );
  }
}
