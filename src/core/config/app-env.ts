import { EnvProperty } from './env-property.decorator';
import { Environment } from '../../shared/environment.enum';
import { safe } from '../../shared/utils/safe';

export class AppEnv {
  constructor() {
    const errors: string[] = [];
    for (const key of Object.keys(this)) {
      const [error] = safe(() => void this[key as keyof AppEnv]);
      if (error) {
        errors.push(`${key}: ${String(error)}`);
      }
    }
    if (errors.length) {
      throw new Error(`Errors initializing AppEnv: ${errors.join(', ')}`);
    }
  }

  @EnvProperty({
    name: 'ENVIRONMENT',
    defaultValue: Environment.Development,
  })
  readonly environment!: Environment;

  @EnvProperty({ name: 'PORT', defaultValue: 3000, type: 'number' })
  readonly port!: number;

  @EnvProperty({ name: 'LOG_LEVEL', defaultValue: 'info' })
  readonly logLevel!: string;

  @EnvProperty({ name: 'LOG_DIR', defaultValue: 'logs' })
  readonly logDir!: string;

  @EnvProperty({
    name: 'THROTTLER_TTL_MS',
    type: 'number',
    defaultValue: 60_000,
  })
  readonly throttlerTtlMs!: number;

  @EnvProperty({
    name: 'THROTTLER_LIMIT',
    type: 'number',
    defaultValue: 10,
  })
  readonly throttlerLimit!: number;

  @EnvProperty({ name: 'APP_NAME', defaultValue: 'estetica-prototype-api' })
  readonly appName!: string;

  @EnvProperty({ name: 'BETTER_AUTH_SECRET', required: true })
  readonly betterAuthSecret!: string;

  @EnvProperty({
    name: 'BETTER_AUTH_COOKIE_CACHE_VERSION',
    type: 'number',
    defaultValue: 1,
  })
  readonly betterAuthCookieCacheVersion!: number;

  @EnvProperty({
    name: 'SERVER_TIMEOUT_MS',
    type: 'number',
    defaultValue: 60_000,
  })
  readonly serverTimeoutMs!: number;

  @EnvProperty({
    name: 'REQUEST_TIMEOUT_MS',
    type: 'number',
    defaultValue: 30_000,
  })
  readonly requestTimeoutMs!: number;

  @EnvProperty({
    name: 'MAIN_DATABASE_URL',
    required: true,
  })
  readonly mainDatabaseUrl!: string;

  @EnvProperty({
    name: 'MAIN_DATABASE_MIGRATION_URL',
    required: true,
  })
  readonly mainDatabaseMigrationUrl!: string;

  @EnvProperty({
    name: 'BETTER_AUTH_ADMIN_NAME',
    defaultValue: 'admin',
  })
  readonly betterAuthAdminName!: string;

  @EnvProperty({
    name: 'BETTER_AUTH_ADMIN_PASSWORD',
    required: true,
  })
  readonly betterAuthAdminPassword!: string;

  @EnvProperty({
    name: 'BETTER_AUTH_ADMIN_EMAIL',
    required: true,
  })
  readonly betterAuthAdminEmail!: string;

  @EnvProperty({
    name: 'BETTER_AUTH_TRUSTED_ORIGINS',
    required: true,
    type: 'list',
  })
  readonly betterAuthTrustedOrigins!: string[];

  static readonly instance = new AppEnv();
}
