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

/** Página del feed público (GET /posts/feed) */
export interface PostsFeed {
  items: Post[];
  /** Cursor para la siguiente página; null cuando no hay más posts */
  nextCursor: number | null;
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

