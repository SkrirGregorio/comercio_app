import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import type { Empresa } from '../models/empresa.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class EmpresasService {
  private readonly api = inject(ApiService);

  list(): Observable<Empresa[]> { return this.api.get('/empresas'); }
  getAll(): Observable<Empresa[]> { return this.api.get('/empresas'); }
  getMisEmpresas(): Observable<Empresa[]> { return this.api.get('/empresas/mis-empresas'); }
  get(id: number): Observable<Empresa> { return this.api.get(`/empresas/${id}`); }
  getById(id: number): Observable<Empresa> { return this.api.get(`/empresas/${id}`); }
  create(payload: Partial<Empresa>): Observable<Empresa> { return this.api.post('/empresas', payload); }
  update(id: number, payload: Partial<Empresa>): Observable<Empresa> { return this.api.patch(`/empresas/${id}`, payload); }
  delete(id: number): Observable<void> { return this.api.delete(`/empresas/${id}`); }
}
