import { MainDatasource } from '../main-database-connection';
import {
  InjectTransactionHost,
  TransactionHost,
} from '@nestjs-cls/transactional';
import { MAIN_DATABASE_CONNECTION_NAME } from '../main-database-connection-name';
import { TransactionalAdapterDrizzleOrm } from '@nestjs-cls/transactional-adapter-drizzle-orm';
import { allEntities } from '../all-entities';

export abstract class Repository {
  public constructor(
    @InjectTransactionHost(MAIN_DATABASE_CONNECTION_NAME)
    private readonly txHost: TransactionHost<
      TransactionalAdapterDrizzleOrm<MainDatasource>
    >,
  ) {}

  protected get db() {
    const tx = this.txHost.tx;
    tx.e ??= allEntities;
    return tx;
  }
}
