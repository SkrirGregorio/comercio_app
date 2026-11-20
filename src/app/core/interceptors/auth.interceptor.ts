import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { storage } from '../../shared/utils/storage';
import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const token = storage.token;
  // Solo se envía el token a nuestra API, nunca a terceros (p. ej. Google)
  const isApi = req.url.startsWith('http://') || req.url.startsWith('https://')
    ? req.url.startsWith(environment.apiBaseUrl)
    : true;

  const authReq = token && isApi
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((err: unknown) => {
      // Token expirado o inválido: cerrar sesión y llevar al login
      // (/auth/profile lo resuelve AuthService.ensureProfile y los guards deciden la redirección)
      const skip = req.url.endsWith('/auth/login') || req.url.endsWith('/auth/profile');
      if (isApi && token && !skip && err instanceof HttpErrorResponse && err.status === 401) {
        auth.logout();
        router.navigate(['/auth/login'], { queryParams: { returnUrl: router.url } });
      }
      return throwError(() => err);
    })
  );
};
