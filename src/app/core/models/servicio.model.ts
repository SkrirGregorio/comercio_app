import { Empresa } from './empresa.model';

export interface Servicio {
  id: number;
  nombre: string;
  descripcion?: string;
  icono?: string;
  empresas?: Empresa[];
}

export interface CreateServicioDto {
  nombre: string;
  descripcion?: string;
}

export interface UpdateServicioDto {
  nombre?: string;
  descripcion?: string;
}

