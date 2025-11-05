import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Servicio, CreateServicioDto, UpdateServicioDto } from '../models/servicio.model';

@Injectable({
  providedIn: 'root'
})
export class ServiciosService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiBaseUrl}/servicios`;

  /**
   * Obtener todos los servicios
   */
  list(): Observable<Servicio[]> {
    return this.http.get<Servicio[]>(this.apiUrl);
  }

  /**
   * Obtener servicios de una empresa específica
   */
  getByEmpresa(empresaId: number): Observable<Servicio[]> {
    return this.http.get<Servicio[]>(`${this.apiUrl}?empresaId=${empresaId}`);
  }

  /**
   * Obtener un servicio por ID
   */
  get(id: number): Observable<Servicio> {
    return this.http.get<Servicio>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crear un nuevo servicio
   */
  create(data: CreateServicioDto): Observable<Servicio> {
    return this.http.post<Servicio>(this.apiUrl, data);
  }

  /**
   * Actualizar un servicio
   */
  update(id: number, data: UpdateServicioDto): Observable<Servicio> {
    return this.http.patch<Servicio>(`${this.apiUrl}/${id}`, data);
  }

  /**
   * Eliminar un servicio
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Alias methods para compatibilidad
  getAll(): Observable<Servicio[]> {
    return this.list();
  }

  getById(id: number): Observable<Servicio> {
    return this.get(id);
  }
}
