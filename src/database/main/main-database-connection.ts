import { type FactoryProvider } from '@nestjs/common';
import { AppConfig } from '../../shared/config/app-config';
import { LoggerService } from '../../shared/logger/logger.service';
import { drizzle } from 'drizzle-orm/neon-http';
import { getClazz } from '../../shared/utils/get-clazz';
import { mainEntities } from './main-entities';
import { mainRelations } from './main-relations';
import { neon, NeonQueryFunction } from '@neondatabase/serverless';

function getPool(appConfig: AppConfig) {
  return neon(appConfig.mainDatabaseUrl);
}

export const MAIN_DATABASE_CONNECTION_POOL = 'MAIN_DATABASE_CONNECTION_POOL';

export const MAIN_DATABASE_CONNECTION_POOL_PROVIDER: FactoryProvider = {
  provide: MAIN_DATABASE_CONNECTION_POOL,
  inject: [AppConfig],
  useFactory: getPool,
};

function getDatabaseClient(
  pool: NeonQueryFunction<false, false>,
  logger: LoggerService,
) {
  logger.setContext(MainDatasource.name);
  return Object.assign(
    drizzle({
      client: pool,
      relations: mainRelations,
      jit: true,
      // schema: mainEntities,
      logger: {
        logQuery: (query, parameters) => {
          logger.debug(`${query} --${JSON.stringify(parameters)}`, {
            parameters,
          });
        },
      },
    }),
    {
      e: mainEntities,
    },
  );
}

export class MainDatasource extends getClazz<
  ReturnType<typeof getDatabaseClient>
>() {}

export const MAIN_DATASOURCE_CLIENTE_PROVIDER: FactoryProvider = {
  provide: MainDatasource,
  inject: [MAIN_DATABASE_CONNECTION_POOL, LoggerService],
  useFactory: getDatabaseClient,
};

export const MAIN_DATABASE_PROVIDERS = [
  MAIN_DATABASE_CONNECTION_POOL_PROVIDER,
  MAIN_DATASOURCE_CLIENTE_PROVIDER,
];
