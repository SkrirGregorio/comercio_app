import { Empresa } from './empresa.model';

export interface Post {
  id: number;
  titulo: string;
  contenido: string;
  imagenUrl?: string;
  urlImagen?: string; // Alias para compatibilidad
  fechaCreacion: string | Date;
  createdAt?: Date;
  updatedAt?: Date;
  empresaId: number;
  empresa?: Empresa;
}

export interface CreatePostDto {
  titulo: string;
  contenido: string;
  urlImagen?: string;
  imagenUrl?: string;
  empresaId: number;
}

export interface UpdatePostDto {
  titulo?: string;
  contenido?: string;
  urlImagen?: string;
  imagenUrl?: string;
}

