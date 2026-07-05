import { betterAuth } from 'better-auth';
import { AppConfig } from '../shared/config/app-config';
import { admin, anonymous, openAPI, organization } from 'better-auth/plugins';
import { pinoLogger } from '../shared/logger/logger.config';
import { LoggerService } from '../shared/logger/logger.service';
import { getMigrationPool } from '../database/main/main-database-connection';
import { z } from 'zod';

const appConfig = AppConfig.instance;

const logger = new LoggerService(pinoLogger, 'Auth');

export const AuthRole = {
  Admin: 'admin',
  User: 'user',
} as const;

export type AuthRole = (typeof AuthRole)[keyof typeof AuthRole];

export const AuthOrgRole = {
  Owner: 'owner',
  Admin: 'admin',
  User: 'user',
} as const;

export type AuthOrgRole = (typeof AuthOrgRole)[keyof typeof AuthOrgRole];

const organizationSchema = z
  .object({
    membershipLimit: z.number().positive(),
  })
  .catch({
    membershipLimit: 1,
  });

export const auth = betterAuth({
  database: getMigrationPool(appConfig),
  logger: {
    log: (level, message, ...args) => {
      logger[level](message, { ...args });
    },
  },
  appName: appConfig.appName,
  plugins: [
    openAPI({
      path: 'openapi',
    }),
    admin(),
    anonymous(),
    organization({
      requireEmailVerificationOnInvitation: false, // TODO
      allowUserToCreateOrganization: (user) => user.role === AuthRole.Admin,
      disableOrganizationDeletion: true,
      schema: {
        organization: {
          additionalFields: {
            membershipLimit: {
              defaultValue: 1,
              fieldName: 'membership_limit',
              required: true,
              type: 'number',
              validator: {
                input: z.int().positive(),
              },
            },
          },
        },
      },
      membershipLimit: (_, organization) => {
        return organizationSchema.parse(organization).membershipLimit;
      },
    }),
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
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // TODO
  },
});

export type BetterAuthSession = typeof auth.$Infer.Session;
export type BetterAuthUser = BetterAuthSession['user'];
export type BetterAuthOrganization = typeof auth.$Infer.Organization;
