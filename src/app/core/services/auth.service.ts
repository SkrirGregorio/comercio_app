import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from './api.service';
import type { Usuario } from '../models/usuario.model';
import { Observable, of, tap } from 'rxjs';
import { storage } from '../../shared/utils/storage';

export interface AuthResponse {
  access_token: string;
}

export interface LoginDto { email: string; password: string }
export interface RegisterDto { nombre: string; email: string; password: string; role: 'admin' | 'propietario' | 'consumidor' }
export interface UpdateProfileDto { nombre?: string; email?: string; photoUrl?: string }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);

  readonly user = signal<Usuario | null>(null);
  readonly isAuthenticated = signal<boolean>(false);

  loadProfile(): Observable<Usuario | null> {
    if (!storage.token) return of(null);
    return this.api.get<Usuario>('/auth/profile').pipe(
      tap((u) => {
        this.user.set(u);
        this.isAuthenticated.set(true);
      })
    );
  }

  profile(): Observable<Usuario> {
    return this.api.get<Usuario>('/auth/profile');
  }

  login(dto: LoginDto): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('/auth/login', dto).pipe(
      tap((res) => {
        storage.token = res.access_token;
        this.isAuthenticated.set(true);
      })
    );
  }

  register(dto: RegisterDto): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('/auth/register', dto).pipe(
      tap((res) => {
        storage.token = res.access_token;
        this.isAuthenticated.set(true);
      })
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
}
