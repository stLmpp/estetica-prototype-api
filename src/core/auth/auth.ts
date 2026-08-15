import { betterAuth, type ModelNames } from 'better-auth';
import { AppEnv } from '../config/app-env';
import { admin, openAPI, organization } from 'better-auth/plugins';
import { LoggerService } from '../logger/logger.service';
import { getMigrationPool } from '../../database/main/main-database-connection';
import { z } from 'zod';
import { v7 as uuidv7 } from 'uuid';
import { BetterAuthRedisSecondaryStorage } from '../redis/better-auth-redis-secondary-storage';
import { AuthRole } from './constants';
import { adminAccessControl } from './admin-access-control';
import { organizationAccessControl } from './organization-access-control';
import { WorkingHoursJsonSchema } from '../../shared/model/working-hours.model';

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
    admin({
      ac: adminAccessControl.ac,
      roles: {
        admin: adminAccessControl.admin,
        user: adminAccessControl.user,
      },
    }),
    organization({
      ac: organizationAccessControl.ac,
      roles: {
        owner: organizationAccessControl.owner,
        admin: organizationAccessControl.admin,
        member: organizationAccessControl.member,
      },
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
            customerLimit: {
              defaultValue: 100,
              fieldName: 'customer_limit',
              required: true,
              type: 'number',
              validator: {
                input: z.int().nonnegative(),
              },
            },
            workingHours: {
              fieldName: 'working_hours',
              required: false,
              type: 'string',
              validator: {
                input: WorkingHoursJsonSchema,
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
