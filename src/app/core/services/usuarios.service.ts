import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Usuario, Role } from '../models/usuario.model';

export interface UpdateUserRoleDto {
  role: Role;
}

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiBaseUrl}/usuarios`;

  /**
   * Obtener todos los usuarios (solo admin)
   */
  list(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.apiUrl);
  }

  /**
   * Obtener un usuario por ID
   */
  get(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/${id}`);
  }

  /**
   * Actualizar el rol de un usuario (solo admin)
   */
  updateRole(id: number, data: UpdateUserRoleDto): Observable<Usuario> {
    return this.http.patch<Usuario>(`${this.apiUrl}/${id}/role`, data);
  }

  /**
   * Eliminar un usuario (solo admin)
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
