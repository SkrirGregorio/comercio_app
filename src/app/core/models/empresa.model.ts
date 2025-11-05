import type { Usuario } from './usuario.model';
import type { Post } from './post.model';
import type { Servicio } from './servicio.model';
import type { Resena } from './resena.model';

export interface Empresa {
  id: number;
  nombre: string;
  descripcion?: string;
  direccion: string;
  telefono?: string;
  email?: string;
  webSite?: string;
  latitud?: number;
  longitud?: number;
  horario?: string;
  urlAvatar?: string;
  urlPortada?: string;
  calificacionPromedio?: number;
  fechaRegistro: string | Date;
  propietario?: Usuario;
  posts?: Post[];
  servicios?: Servicio[];
  resenas?: Resena[];
}
