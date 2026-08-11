import { type adminAccessControl } from './admin-access-control';
import { type organizationAccessControl } from './organization-access-control';
import { applyDecorators, SetMetadata } from '@nestjs/common';
import { type RequireExactlyOne } from 'type-fest';
import { type AuthOrgRole, type AuthRole } from './constants';

/**
 * Like better-auth's `RoleStatements`, but resolves each resource to a plain
 * mutable array instead of `T[number][] | ReadonlyArray<T[number]>`. The
 * readonly half of that union isn't assignable to the mutable array type
 * `userHasPermission`/`hasPermission` expect in their body, which trips
 * `TS2769: No overload matches this call` at every call site.
 */
type PermissionCheck<TStatements extends Record<string, readonly string[]>> = {
  [K in keyof TStatements]?: TStatements[K][number][];
};

type AdminPermissionCheck = PermissionCheck<
  typeof adminAccessControl.ac.statements
>;

type OrgPermissionCheck = PermissionCheck<
  typeof organizationAccessControl.ac.statements
>;

export type BaseHasPermission = {
  permissions?: AdminPermissionCheck;
  orgPermissions?: OrgPermissionCheck;
  roles?: AuthRole[];
  orgRoles?: AuthOrgRole[];
  withoutImplicitAdminAccess?: boolean;
};

export type HasPermissionOptionsV2 = RequireExactlyOne<
  BaseHasPermission & {
    or?: RequireExactlyOne<BaseHasPermission>[];
    and?: RequireExactlyOne<BaseHasPermission>[];
  }
>;

export type HasPermissionMode = 'and' | 'or';

/**
 * Metadata shape consumed by `HasPermissionGuard`. Computed once when the
 * decorator is applied (module load) instead of on every request, so the
 * guard just iterates `checks` without re-deriving `or`/`and`/single-check
 * branching each time.
 */
export interface NormalizedHasPermission {
  mode: HasPermissionMode;
  checks: BaseHasPermission[];
  /**
   * True when an active organization is required no matter which check(s)
   * end up deciding the outcome, letting the guard reject before making any
   * API call: for `and`, any org-scoped check forces it; for `or`, only if
   * every branch is org-scoped (otherwise a non-org branch could still pass).
   */
  requiresActiveOrg: boolean;
  withoutImplicitAdminAccess: boolean;
}

function isOrgScoped(check: BaseHasPermission): boolean {
  return !!check.orgPermissions || !!check.orgRoles;
}

export function HasPermission(options: HasPermissionOptionsV2) {
  if (options.or && !options.or.length) {
    throw new Error('options.or must have at least one element');
  }

  if (options.and && !options.and.length) {
    throw new Error('options.and must have at least one element');
  }

  const mode: HasPermissionMode = options.or ? 'or' : 'and';
  const checks: BaseHasPermission[] = options.or ?? options.and ?? [options];
  const requiresActiveOrg =
    mode === 'and' ? checks.some(isOrgScoped) : checks.every(isOrgScoped);

  const normalized: NormalizedHasPermission = {
    mode,
    checks,
    requiresActiveOrg,
    withoutImplicitAdminAccess: options.withoutImplicitAdminAccess ?? false,
  };

  return applyDecorators(SetMetadata('has-permission', normalized));
}
