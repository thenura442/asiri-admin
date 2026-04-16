import { CanActivateFn, ActivatedRouteSnapshot, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Role } from '../../../enums/role.enum';
import { ROLE_HOME } from '../../../constants/role-permissions.constants';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state) => {
  const router       = inject(Router);
  const allowedRoles = (route.data['roles'] ?? []) as Role[];

  // No roles specified — all authenticated users allowed
  if (allowedRoles.length === 0) return true;

  const stored = localStorage.getItem('asiri_user');
  if (!stored) return router.createUrlTree(['/login']);

  try {
    const user = JSON.parse(stored) as { role: Role };
    if (allowedRoles.includes(user.role)) return true;

    const home = ROLE_HOME[user.role] ?? '/dashboard';
    return router.createUrlTree([home]);
  } catch {
    return router.createUrlTree(['/login']);
  }
};