import {
  type TransactionalAdapter,
  type TransactionalAdapterOptions,
} from '@nestjs-cls/transactional';
import { type DrizzleOrmTransactionalAdapterOptions } from '@nestjs-cls/transactional-adapter-drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { type ClsService, ClsServiceManager } from 'nestjs-cls';
import { CLS_TENANT_ID_KEY, RLS_ROLE } from '../auth/constants';
import { sql } from 'drizzle-orm';

type AnyDrizzleClient = NodePgDatabase;

type DrizzleTransactionOptions<T> = T extends AnyDrizzleClient
  ? Parameters<T['transaction']>[1]
  : never;

export class TransactionalAdapterDrizzleOrmCustom<
  TClient extends AnyDrizzleClient,
> implements TransactionalAdapter<
  TClient,
  TClient,
  DrizzleTransactionOptions<TClient>
> {
  constructor(options: DrizzleOrmTransactionalAdapterOptions<TClient>) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this.connectionToken = options.drizzleInstanceToken;
    this.defaultTxOptions = options.defaultTxOptions as never;
    this.clsService = ClsServiceManager.getClsService();
  }

  connectionToken: any;

  defaultTxOptions?: Partial<DrizzleTransactionOptions<TClient>>;

  private readonly clsService: ClsService;

  optionsFactory = (
    drizzleInstance: TClient,
  ): TransactionalAdapterOptions<
    TClient,
    DrizzleTransactionOptions<TClient>
  > => {
    type RunTx = (
      client: TClient,
      options: DrizzleTransactionOptions<TClient>,
      fn: (...args: any[]) => any,
      setClient: (client?: TClient) => void,
    ) => Promise<any>;

    const asyncRunTx: RunTx = (client, options, fn, setClient) =>
      client.transaction(async (tx) => {
        const tenantId: string = this.clsService.get(CLS_TENANT_ID_KEY);
        await tx.execute(sql`SET LOCAL role '${sql.raw(RLS_ROLE)}';`);
        await tx.execute(sql`SET LOCAL tenant.id = '${sql.raw(tenantId)}';`);
        setClient(tx as never);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return fn();
      }, options);

    return {
      wrapWithTransaction: (
        options: DrizzleTransactionOptions<TClient>,
        fn: (...args: any[]) => Promise<any>,
        setClient: (client?: TClient) => void,
      ) => asyncRunTx(drizzleInstance, options, fn, setClient),
      wrapWithNestedTransaction: (
        options: DrizzleTransactionOptions<TClient>,
        fn: (...args: any[]) => Promise<any>,
        setClient: (client?: TClient) => void,
        client: TClient,
      ) => asyncRunTx(client, options, fn, setClient),
      getFallbackInstance: () => drizzleInstance,
    };
  };
}
