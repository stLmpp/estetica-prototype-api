import {
  MemberHasPermission,
  type MemberHasPermissionOptions,
  UserHasPermission,
  type UserHasPermissionOptions,
} from '@thallesp/nestjs-better-auth';
import { type RoleStatements } from 'better-auth/plugins/access';
import { type adminAccessControl } from './admin-access-control';
import { type organizationAccessControl } from './organization-access-control';
import { applyDecorators, SetMetadata } from '@nestjs/common';
import { RequireExactlyOne } from 'type-fest';
import { AuthOrgRole, AuthRole } from './constants';

type AdminPermissionCheck = RoleStatements<
  typeof adminAccessControl.ac.statements
>;

type OrgPermissionCheck = RoleStatements<
  typeof organizationAccessControl.ac.statements
>;

interface HasPermissionOptions extends Omit<
  UserHasPermissionOptions,
  'permission' | 'permissions'
> {
  permission?: AdminPermissionCheck;
  permissions?: AdminPermissionCheck;
}

/**
 * Typed wrapper around `@UserHasPermission` whose `permission`/`permissions`
 * are checked against the actual resources/actions declared in
 * `adminAccessControl`, so a typo'd resource or action fails at compile time
 * instead of silently denying access at runtime.
 */
export function HasPermission(options: HasPermissionOptions) {
  return UserHasPermission(options as UserHasPermissionOptions);
}

interface OrgHasPermissionOptions extends Omit<
  MemberHasPermissionOptions,
  'permissions'
> {
  permissions: OrgPermissionCheck;
}

/**
 * Typed wrapper around `@MemberHasPermission` whose `permissions` are
 * checked against the actual resources/actions declared in
 * `organizationAccessControl`, so a typo'd resource or action fails at
 * compile time instead of silently denying access at runtime.
 */
export function OrgHasPermission(options: OrgHasPermissionOptions) {
  return applyDecorators(
    MemberHasPermission(options as MemberHasPermissionOptions),
  );
}

export type BaseHasPermission = {
  permissions?: AdminPermissionCheck;
  orgPermissions?: OrgPermissionCheck;
  roles?: AuthRole[];
  orgRoles?: AuthOrgRole[];
};

export type HasPermissionOptionsV2 = RequireExactlyOne<
  BaseHasPermission & {
    or?: RequireExactlyOne<BaseHasPermission>[];
    and?: RequireExactlyOne<BaseHasPermission>[];
  }
>;

export function HasPermissionV2(options: HasPermissionOptionsV2) {
  if (options.or && !options.or.length) {
    throw new Error('options.or must have at least one element');
  }

  if (options.and && !options.and.length) {
    throw new Error('options.and must have at least one element');
  }

  return applyDecorators(SetMetadata('has-permission', options));
}
