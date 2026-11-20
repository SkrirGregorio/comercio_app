import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { map } from 'rxjs';
import { AuthService } from '../services/auth.service';
import type { Role } from '../models/usuario.model';

/**
 * Restringe una ruta a ciertos roles. Úsese junto con authGuard.
 * Nota: es solo experiencia de usuario; la autorización real la hace la API.
 */
export function roleGuard(allowed: Role[], fallback = '/dashboard'): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    return auth.ensureProfile().pipe(
      map((user) => {
        if (!user) return router.createUrlTree(['/auth/login']);
        return allowed.includes(user.role) ? true : router.createUrlTree([fallback]);
      })
    );
  };
}

/** Evita que un usuario con sesión vea login/registro. */
export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.ensureProfile().pipe(map((user) => (user ? router.createUrlTree(['/dashboard']) : true)));
};
