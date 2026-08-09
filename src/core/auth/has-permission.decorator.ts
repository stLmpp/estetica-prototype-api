import {
  MemberHasPermission,
  type MemberHasPermissionOptions,
  UserHasPermission,
  type UserHasPermissionOptions,
} from '@thallesp/nestjs-better-auth';
import { type RoleStatements } from 'better-auth/plugins/access';
import { adminAccessControl } from './admin-access-control';
import { organizationAccessControl } from './organization-access-control';

type AdminPermissionCheck = RoleStatements<
  typeof adminAccessControl.ac.statements
>;

type OrgPermissionCheck = RoleStatements<
  typeof organizationAccessControl.ac.statements
>;

interface HasPermissionOptions
  extends Omit<UserHasPermissionOptions, 'permission' | 'permissions'> {
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

interface OrgHasPermissionOptions
  extends Omit<MemberHasPermissionOptions, 'permissions'> {
  permissions: OrgPermissionCheck;
}

/**
 * Typed wrapper around `@MemberHasPermission` whose `permissions` are
 * checked against the actual resources/actions declared in
 * `organizationAccessControl`, so a typo'd resource or action fails at
 * compile time instead of silently denying access at runtime.
 */
export function OrgHasPermission(options: OrgHasPermissionOptions) {
  return MemberHasPermission(options as MemberHasPermissionOptions);
}
