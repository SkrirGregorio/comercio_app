import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsuariosService } from '../../../../core/services/usuarios.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Usuario, Role } from '../../../../core/models/usuario.model';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-admin-usuarios',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent],
  templateUrl: './admin-usuarios.component.html',
  styleUrl: './admin-usuarios.component.css'
})
export class AdminUsuariosComponent implements OnInit {
  private usuariosService = inject(UsuariosService);
  private authService = inject(AuthService);

  usuarios = signal<Usuario[]>([]);
  loading = signal<boolean>(true);
  error = signal<string>('');
  editingUserId = signal<number | null>(null);
  selectedRole = signal<Role>('consumidor');
  currentUserData = signal<Usuario | null>(null);

  // Verificar si el usuario actual es admin
  get isAdmin() {
    return this.currentUserData()?.role === 'admin';
  }

  ngOnInit() {
    // Primero cargar el perfil del usuario actual
    this.authService.profile().subscribe({
      next: (user: Usuario) => {
        this.currentUserData.set(user);
        if (user.role !== 'admin') {
          this.error.set('No tienes permisos para acceder a esta página');
          this.loading.set(false);
          return;
        }
        this.loadUsuarios();
      },
      error: (err: any) => {
        this.error.set('Error al cargar el perfil');
        this.loading.set(false);
      }
    });
  }

  loadUsuarios() {
    this.loading.set(true);
    this.error.set(''); // Limpiar error anterior
    this.usuariosService.list().subscribe({
      next: (data: Usuario[]) => {
        this.usuarios.set(data);
        this.loading.set(false);
      },
      error: (err: any) => {
        console.error('Error al cargar usuarios:', err);
        this.error.set('Error al cargar usuarios. El endpoint /usuarios podría no estar disponible en el backend.');
        this.loading.set(false);
      }
    });
  }

  startEditRole(usuario: Usuario) {
    this.editingUserId.set(usuario.id);
    this.selectedRole.set(usuario.role);
  }

  cancelEdit() {
    this.editingUserId.set(null);
  }

  updateRole(usuarioId: number) {
    const newRole = this.selectedRole();
    this.usuariosService.updateRole(usuarioId, { role: newRole }).subscribe({
      next: (updatedUser: Usuario) => {
        // Actualizar el usuario en la lista
        const usuarios = this.usuarios();
        const index = usuarios.findIndex(u => u.id === usuarioId);
        if (index !== -1) {
          usuarios[index] = updatedUser;
          this.usuarios.set([...usuarios]);
        }
        this.editingUserId.set(null);
      },
      error: (err: any) => {
        this.error.set('Error al actualizar el rol del usuario');
      }
    });
  }

  deleteUsuario(usuarioId: number) {
    if (usuarioId === this.currentUserData()?.id) {
      alert('No puedes eliminar tu propia cuenta');
      return;
    }

    if (confirm('¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.')) {
      this.usuariosService.delete(usuarioId).subscribe({
        next: () => {
          this.usuarios.set(this.usuarios().filter(u => u.id !== usuarioId));
        },
        error: (err: any) => {
          this.error.set('Error al eliminar usuario');
        }
      });
    }
  }

  onRoleChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.selectedRole.set(select.value as Role);
  }

  getRoleBadgeClass(role: Role): string {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'propietario':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'consumidor':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  getRoleLabel(role: Role): string {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'propietario':
        return 'Propietario';
      case 'consumidor':
        return 'Consumidor';
      default:
        return role;
    }
  }

  getAdminCount(): number {
    return this.usuarios().filter(u => u.role === 'admin').length;
  }

  getPropietarioCount(): number {
    return this.usuarios().filter(u => u.role === 'propietario').length;
  }

  getConsumidorCount(): number {
    return this.usuarios().filter(u => u.role === 'consumidor').length;
  }
}
