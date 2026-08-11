import {
  defaultStatements,
  ownerAc,
  adminAc,
  memberAc,
} from 'better-auth/plugins/organization/access';
import { createAccessControl } from 'better-auth/plugins/access';

const statement = {
  ...defaultStatements,
  catalogItem: ['get', 'create', 'update', 'delete'],
  person: ['get', 'create', 'update'],
  customer: ['get', 'create', 'update', 'delete'],
} as const;

const ac = createAccessControl(statement);

const owner = ac.newRole({
  catalogItem: ['get', 'create', 'update', 'delete'],
  person: ['get', 'create', 'update'],
  customer: ['get', 'create', 'update', 'delete'],
  ...ownerAc.statements,
});

const admin = ac.newRole({
  catalogItem: ['get', 'create', 'update', 'delete'],
  person: ['get', 'create', 'update'],
  customer: ['get', 'create', 'update', 'delete'],
  ...adminAc.statements,
});

const member = ac.newRole({
  catalogItem: ['get'],
  person: ['get'],
  customer: ['get'],
  ...memberAc.statements,
});

export const organizationAccessControl = {
  owner,
  admin,
  member,
  ac,
};
