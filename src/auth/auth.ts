import { betterAuth, type ModelNames } from 'better-auth';
import { AppEnv } from '../core/config/app-env';
import { admin, openAPI, organization } from 'better-auth/plugins';
import { LoggerService } from '../core/logger/logger.service';
import { getMigrationPool } from '../database/main/main-database-connection';
import { z } from 'zod';
import { v7 as uuidv7 } from 'uuid';
import { extraAuthEndPointsPlugin } from './extra-auth-end-points.plugin';
import { BetterAuthRedisSecondaryStorage } from '../core/redis/better-auth-redis-secondary-storage';
import { AuthRole } from './constants';

const appEnv = AppEnv.instance;

const logger = LoggerService.create('Auth');

const generateIdPrefixMap: Record<ModelNames, string> = {
  account: 'acc',
  invitation: 'invit',
  member: 'memb',
  organization: 'org',
  session: 'ses',
  user: 'user',
  'rate-limit': 'rtlmt',
  verification: 'verif',
  team: 'team',
  'team-member': 'tmemb',
  apikey: 'akey',
  '': 'empt',
};

const organizationSchema = z
  .object({
    membershipLimit: z.number().positive(),
  })
  .catch({
    membershipLimit: 1,
  });

export const auth = betterAuth({
  database: getMigrationPool(appEnv),
  logger: {
    log: (level, message, ...args) => {
      logger[level](message, { ...args });
    },
  },
  hooks: {},
  appName: appEnv.appName,
  trustedOrigins: appEnv.betterAuthTrustedOrigins,
  plugins: [
    openAPI({
      path: 'openapi',
    }),
    admin(),
    organization({
      requireEmailVerificationOnInvitation: false, // TODO
      allowUserToCreateOrganization: (user) => user.role === AuthRole.Admin,
      disableOrganizationDeletion: true,
      schema: {
        organization: {
          modelName: 'auth_organization',
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
        team: {
          modelName: 'auth_team',
        },
        member: {
          modelName: 'auth_member',
        },
        invitation: {
          modelName: 'auth_invitation',
        },
        teamMember: {
          modelName: 'auth_team_member',
        },
        organizationRole: {
          modelName: 'auth_organization_role',
        },
      },
      membershipLimit: (_, organization) => {
        return organizationSchema.parse(organization).membershipLimit;
      },
    }),
    extraAuthEndPointsPlugin(),
  ],
  basePath: '/v1/auth',
  experimental: {
    joins: true,
  },
  baseURL: `http://localhost:${appEnv.port}`,
  secret: appEnv.betterAuthSecret,
  rateLimit: {
    max: appEnv.throttlerLimit,
    window: appEnv.throttlerTtlMs / 1000,
  },
  session: {
    modelName: 'auth_session',
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
      strategy: 'jwt',
      refreshCache: false,
      version: String(appEnv.betterAuthCookieCacheVersion),
    },
  },
  user: {
    modelName: 'auth_user',
  },
  account: {
    modelName: 'auth_account',
  },
  verification: {
    modelName: 'auth_verification',
  },
  advanced: {
    database: {
      generateId: (options) => {
        // console.log(options);
        return `${generateIdPrefixMap[options.model]}_${uuidv7().replaceAll('-', '')}`;
      },
    },
    cookiePrefix: `${appEnv.appName}-better-auth`,
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // TODO
    disableSignUp: true,
  },
  secondaryStorage: BetterAuthRedisSecondaryStorage.getInstance(),
});

export type BetterAuthSession = typeof auth.$Infer.Session;
export type BetterAuthUser = BetterAuthSession['user'];
export type BetterAuthOrganization = typeof auth.$Infer.Organization;
