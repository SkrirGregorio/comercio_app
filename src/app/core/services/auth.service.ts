import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from './api.service';
import type { Role, Usuario } from '../models/usuario.model';
import { Observable, catchError, finalize, of, shareReplay, switchMap, tap } from 'rxjs';
import { storage } from '../../shared/utils/storage';

export interface AuthResponse {
  access_token: string;
}

export interface LoginDto { email: string; password: string }
/** El registro público solo permite estos roles; `admin` lo asigna otro administrador. */
export interface RegisterDto {
  nombre: string;
  email: string;
  password: string;
  role: Extract<Role, 'propietario' | 'consumidor'>;
  /** Debe ser true: la API rechaza el registro sin aceptación de términos */
  aceptaTerminos: boolean;
}
export interface UpdateProfileDto { nombre?: string; email?: string; photoUrl?: string }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);

  readonly user = signal<Usuario | null>(null);
  readonly isAuthenticated = signal<boolean>(false);

  private profileRequest?: Observable<Usuario | null>;

  /**
   * Devuelve el usuario de la sesión, cargándolo del backend si hace falta.
   * Si el token no es válido (401/expirado) cierra la sesión y devuelve null.
   * Las llamadas concurrentes comparten una sola petición (útil para los guards).
   */
  ensureProfile(): Observable<Usuario | null> {
    if (this.user()) return of(this.user());
    if (!storage.token) return of(null);
    this.profileRequest ??= this.api.get<Usuario>('/auth/profile').pipe(
      tap((u) => {
        this.user.set(u);
        this.isAuthenticated.set(true);
      }),
      catchError(() => {
        this.logout();
        return of(null);
      }),
      finalize(() => (this.profileRequest = undefined)),
      shareReplay(1)
    );
    return this.profileRequest;
  }

  /** Alias mantenido por compatibilidad. */
  loadProfile(): Observable<Usuario | null> {
    return this.ensureProfile();
  }

  hasRole(...roles: Role[]): boolean {
    const u = this.user();
    return !!u && roles.includes(u.role);
  }

  profile(): Observable<Usuario> {
    return this.api.get<Usuario>('/auth/profile');
  }

  login(dto: LoginDto): Observable<Usuario | null> {
    return this.api.post<AuthResponse>('/auth/login', dto).pipe(
      switchMap((res) => this.startSession(res.access_token))
    );
  }

  register(dto: RegisterDto): Observable<Usuario | null> {
    return this.api.post<AuthResponse>('/auth/register', dto).pipe(
      switchMap((res) => this.startSession(res.access_token))
    );
  }

  updateProfile(dto: UpdateProfileDto): Observable<Usuario> {
    return this.api.post<Usuario>('/auth/update', dto).pipe(
      tap((u) => this.user.set(u))
    );
  }

  logout(): void {
    storage.token = null;
    this.user.set(null);
    this.isAuthenticated.set(false);
  }

  private startSession(token: string): Observable<Usuario | null> {
    storage.token = token;
    this.user.set(null);
    return this.ensureProfile();
  }
}
