import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { map } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * Exige sesión iniciada. Espera a que se cargue el perfil (p. ej. al recargar la página)
 * antes de decidir, y si no hay sesión válida redirige al login conservando la URL destino.
 */
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.ensureProfile().pipe(
    map((user) =>
      user ? true : router.createUrlTree(['/auth/login'], { queryParams: { returnUrl: state.url } })
    )
  );
};
