import '../../config';
import { defineConfig } from 'drizzle-kit';
import { AppConfig } from '../../shared/config/app-config';

const config = AppConfig.instance;

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/database/main/main-entities.ts',
  dbCredentials: {
    url: config.mainDatabaseUrl,
  },
  out: 'migrations/main',
});
