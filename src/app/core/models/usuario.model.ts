export type Role = 'admin' | 'propietario' | 'consumidor';

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  photoUrl?: string;
  role: Role;
}
