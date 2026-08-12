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
  employee: ['get', 'create', 'update', 'delete'],
  employeeService: ['get', 'create', 'delete'],
  appointment: ['get', 'create', 'update', 'updateStatus', 'delete'],
} as const;

const ac = createAccessControl(statement);

const owner = ac.newRole({
  catalogItem: ['get', 'create', 'update', 'delete'],
  person: ['get', 'create', 'update'],
  customer: ['get', 'create', 'update', 'delete'],
  employee: ['get', 'create', 'update', 'delete'],
  employeeService: ['get', 'create', 'delete'],
  appointment: ['get', 'create', 'update', 'updateStatus', 'delete'],
  ...ownerAc.statements,
});

const admin = ac.newRole({
  catalogItem: ['get', 'create', 'update', 'delete'],
  person: ['get', 'create', 'update'],
  customer: ['get', 'create', 'update', 'delete'],
  employee: ['get'],
  employeeService: ['get', 'create', 'delete'],
  appointment: ['get', 'create', 'update', 'updateStatus', 'delete'],
  ...adminAc.statements,
});

const member = ac.newRole({
  catalogItem: ['get'],
  person: ['get'],
  customer: ['get'],
  employee: ['get'],
  employeeService: ['get'],
  appointment: ['get', 'create', 'update', 'updateStatus'],
  ...memberAc.statements,
});

export const organizationAccessControl = {
  owner,
  admin,
  member,
  ac,
};
