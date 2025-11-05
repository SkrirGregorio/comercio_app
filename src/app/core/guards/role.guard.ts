import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import type { Role } from '../models/usuario.model';

export function roleGuard(allowed: Role[]): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const user = auth.user();
    if (user && allowed.includes(user.role)) {
      return true;
    }
    return router.createUrlTree(['/']);
  };
}
