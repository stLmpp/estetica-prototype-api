import { betterAuth } from 'better-auth';
import { AppConfig } from '../shared/config/app-config';
import { admin, anonymous, openAPI } from 'better-auth/plugins';
import { pinoLogger } from '../shared/logger/logger.config';
import { LoggerService } from '../shared/logger/logger.service';
import { Pool } from 'pg';

const appConfig = AppConfig.instance;

const logger = new LoggerService(pinoLogger, 'Auth');

export const auth = betterAuth({
  database: new Pool({
    connectionString: appConfig.mainDatabaseUrl,
  }),
  logger: {
    log: (level, message, ...args) => {
      logger[level](message, { ...args });
    },
  },
  appName: appConfig.appName,
  plugins: [
    openAPI(),
    admin() as never,
    anonymous(),
  ],
  basePath: '/v1/auth',
  experimental: {
    joins: true,
  },
  baseURL: `http://localhost:${appConfig.port}`,
  secret: appConfig.betterAuthSecret,
  rateLimit: {
    max: appConfig.throttlerLimit,
    window: appConfig.throttlerTtlMs / 1000,
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
      strategy: 'jwt',
      refreshCache: false,
      version: String(appConfig.betterAuthCookieCacheVersion),
    },
  },
  advanced: {
    cookiePrefix: `${appConfig.appName}-better-auth`,
  },
});

export const AuthRole = {
  Admin: 'admin',
  User: 'user',
} as const;

export type AuthRole = (typeof AuthRole)[keyof typeof AuthRole];
