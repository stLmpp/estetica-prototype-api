import '../../config';
import { defineConfig } from 'drizzle-kit';
import { AppEnv } from '../../core/config/app-env';

const appEnv = AppEnv.instance;

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/database/main/main-entities.ts',
  dbCredentials: {
    url: appEnv.mainDatabaseMigrationUrl,
  },
  out: 'migrations/main',
  tablesFilter: ['auth_*'],
});
