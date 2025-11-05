import type { Usuario } from './usuario.model';

export interface Resena {
  id: number;
  comentario: string;
  calificacion: 1 | 2 | 3 | 4 | 5;
  fechaCreacion: string | Date;
  usuario: Usuario;
  empresaId: number;
}
