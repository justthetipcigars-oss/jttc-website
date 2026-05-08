// Pure utilities — safe to import from client and server.
// Heavier helpers that need DB access live in @/lib/auth (server-only).

export type Role = 'admin' | 'manager' | 'tobacconist';

const HIERARCHY: Record<Role, Role[]> = {
  admin:       ['admin', 'manager', 'tobacconist'],
  manager:     ['manager', 'tobacconist'],
  tobacconist: ['tobacconist'],
};

export function roleSatisfies(userRole: Role, required: Role): boolean {
  return HIERARCHY[userRole].includes(required);
}

export function roleSatisfiesAny(userRole: Role, allowed: Role[]): boolean {
  return allowed.some(r => HIERARCHY[userRole].includes(r));
}

export function landingPathForRole(role: Role): string {
  if (role === 'tobacconist') return '/admin/dashboard/tobacconist';
  return '/admin/dashboard';
}
