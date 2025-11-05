import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Resena } from '../models/resena.model';

@Injectable({
  providedIn: 'root'
})
export class ResenasService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiBaseUrl}/resenas`;

  /**
   * Obtener todas las reseñas
   */
  list(): Observable<Resena[]> {
    return this.http.get<Resena[]>(this.apiUrl);
  }

  /**
   * Obtener reseñas de una empresa específica
   */
  getByEmpresa(empresaId: number): Observable<Resena[]> {
    return this.http.get<Resena[]>(`${this.apiUrl}?empresaId=${empresaId}`);
  }

  /**
   * Obtener una reseña por ID
   */
  get(id: number): Observable<Resena> {
    return this.http.get<Resena>(`${this.apiUrl}/${id}`);
  }

  /**
   * Eliminar una reseña
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
