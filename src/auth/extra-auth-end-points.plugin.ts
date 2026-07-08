import { type BetterAuthPlugin } from 'better-auth';
import { createAuthEndpoint, sessionMiddleware } from 'better-auth/api';
import { z } from 'zod';
import { auth } from './auth';

export function extraAuthEndPointsPlugin(): BetterAuthPlugin {
  return {
    id: 'extra-auth-end-points',
    endpoints: {
      addOrganizationMember: createAuthEndpoint(
        '/organization/memeber/create',
        {
          method: 'POST',
          body: z.object({
            organizationId: z.string(),
            userId: z.string(),
          }),
          use: [sessionMiddleware],
        },
        async (ctx) => {
          return auth.api.addMember({
            body: {
              role: 'member',
              userId: ctx.body.userId,
              organizationId: ctx.body.organizationId,
            },
            headers: ctx.headers,
          });
        },
      ),
    },
  };
}
