import { ConfigProperty } from './config-property.decorator';
import { Environment } from '../environment.enum';
import { safe } from '../utils/safe';

export class AppConfig {
  constructor() {
    const errors: string[] = [];
    for (const key of Object.keys(this)) {
      const [error] = safe(() => void this[key as keyof AppConfig]);
      if (error) {
        errors.push(`${key}: ${String(error)}`);
      }
    }
    if (errors.length) {
      throw new Error(`Errors initializing AppConfig: ${errors.join(', ')}`);
    }
  }

  @ConfigProperty({
    name: 'ENVIRONMENT',
    defaultValue: Environment.Development,
  })
  readonly environment!: Environment;

  @ConfigProperty({ name: 'PORT', defaultValue: 3000, type: 'number' })
  readonly port!: number;

  @ConfigProperty({ name: 'LOG_LEVEL', defaultValue: 'info' })
  readonly logLevel!: string;

  @ConfigProperty({ name: 'LOG_DIR', defaultValue: 'logs' })
  readonly logDir!: string;

  @ConfigProperty({
    name: 'THROTTLER_TTL_MS',
    type: 'number',
    defaultValue: 60_000,
  })
  readonly throttlerTtlMs!: number;

  @ConfigProperty({
    name: 'THROTTLER_LIMIT',
    type: 'number',
    defaultValue: 10,
  })
  readonly throttlerLimit!: number;

  @ConfigProperty({ name: 'APP_NAME', defaultValue: 'estetica-prototype-api' })
  readonly appName!: string;

  @ConfigProperty({ name: 'BETTER_AUTH_SECRET', required: true })
  readonly betterAuthSecret!: string;

  @ConfigProperty({
    name: 'BETTER_AUTH_COOKIE_CACHE_VERSION',
    type: 'number',
    defaultValue: 1,
  })
  readonly betterAuthCookieCacheVersion!: number;

  @ConfigProperty({
    name: 'SERVER_TIMEOUT_MS',
    type: 'number',
    defaultValue: 60_000,
  })
  readonly serverTimeoutMs!: number;

  @ConfigProperty({
    name: 'REQUEST_TIMEOUT_MS',
    type: 'number',
    defaultValue: 30_000,
  })
  readonly requestTimeoutMs!: number;

  @ConfigProperty({
    name: 'MAIN_DATABASE_URL',
    required: true,
  })
  mainDatabaseUrl!: string;

  static readonly instance = new AppConfig();
}
