import { Role } from '../enums/role.enum';

export const ROUTE_ROLES: Record<string, Role[]> = {
  'dashboard':     [Role.SUPER_ADMIN, Role.FRONT_OFFICE, Role.LAB_MANAGER, Role.BUSINESS_ADMIN],
  'job-requests':  [Role.SUPER_ADMIN, Role.FRONT_OFFICE, Role.LAB_MANAGER],
  'vehicles':      [Role.SUPER_ADMIN, Role.FRONT_OFFICE, Role.LAB_MANAGER],
  'drivers':       [Role.SUPER_ADMIN, Role.FRONT_OFFICE, Role.LAB_MANAGER],
  'patients':      [Role.SUPER_ADMIN, Role.FRONT_OFFICE, Role.LAB_MANAGER],
  'tests':         [Role.SUPER_ADMIN],
  'branches':      [Role.SUPER_ADMIN],
  'lab-approvals': [Role.SUPER_ADMIN, Role.LAB_MANAGER, Role.LAB_TECHNICIAN],
  'users':         [Role.SUPER_ADMIN],
  'reports':       [Role.SUPER_ADMIN, Role.FRONT_OFFICE, Role.LAB_MANAGER, Role.BUSINESS_ADMIN],
  'notifications': [],
  'settings':      [Role.SUPER_ADMIN],
  'profile':       [],
};

// Where each role lands after login
export const ROLE_HOME: Record<Role, string> = {
  [Role.SUPER_ADMIN]:    '/dashboard',
  [Role.FRONT_OFFICE]:   '/dashboard',
  [Role.LAB_MANAGER]:    '/dashboard',
  [Role.LAB_TECHNICIAN]: '/lab-approvals',
  [Role.BUSINESS_ADMIN]: '/dashboard',
};