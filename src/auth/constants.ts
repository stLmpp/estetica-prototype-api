export const CLS_USER_ID_KEY = 'user_id';
export const CLS_TENANT_ID_KEY = 'tenant_id';
export const CLS_SESSION_ROLE_KEY = 'session_role';
export const CLS_SESSION_ORG_ROLE_KEY = 'session_org_role';
export const RLS_ROLE = 'authenticated';
export const GLOBAL_TENANT = 'GLOBAL';
export const GLOBAL_USER = 'GLOBAL';

export const AuthRole = {
  Admin: 'admin',
  User: 'user',
} as const;
export type AuthRole = (typeof AuthRole)[keyof typeof AuthRole];
export const AuthSecurityLevel: Record<AuthRole, number> = {
  [AuthRole.Admin]: 0,
  [AuthRole.User]: 100,
};

export const AuthOrgRole = {
  Owner: 'owner',
  Admin: 'admin',
  User: 'user',
} as const;
export type AuthOrgRole = (typeof AuthOrgRole)[keyof typeof AuthOrgRole];
export const AuthOrgSecurityLevel: Record<AuthOrgRole, number> = {
  [AuthOrgRole.Owner]: 0,
  [AuthOrgRole.Admin]: 100,
  [AuthOrgRole.User]: 200,
};
