import {
  adminAc,
  defaultStatements,
  userAc,
} from 'better-auth/plugins/admin/access';
import { createAccessControl } from 'better-auth/plugins/access';

const statement = {
  ...defaultStatements,
  config: ['get', 'publish'],
} as const;

const ac = createAccessControl(statement);

const admin = ac.newRole({
  config: ['get', 'publish'],
  ...adminAc.statements,
});

const user = ac.newRole({
  config: ['get'],
  ...userAc.statements,
});

export const adminAccessControl = {
  admin,
  user,
  ac,
};
