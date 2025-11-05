import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EmpresasService } from '../../../../core/services/empresas.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Empresa } from '../../../../core/models/empresa.model';

@Component({
  selector: 'app-mis-empresas',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './mis-empresas.component.html',
  styleUrl: './mis-empresas.component.css'
})
export class MisEmpresasComponent implements OnInit {
  private empresasService = inject(EmpresasService);
  private authService = inject(AuthService);
  
  empresas = signal<Empresa[]>([]);
  loading = signal(false);
  error = signal('');

  get isAdmin() {
    return this.authService.user()?.role === 'admin';
  }

  ngOnInit() {
    // Asegurarse de que el usuario esté cargado antes de obtener empresas
    const user = this.authService.user();
    if (user) {
      this.loadMisEmpresas();
    } else {
      // Si no hay usuario en la señal, cargar el perfil primero
      this.authService.loadProfile().subscribe({
        next: () => this.loadMisEmpresas(),
        error: (err) => {
          console.error('Error al cargar perfil:', err);
          this.error.set('Error al cargar el perfil de usuario');
          this.loading.set(false);
        }
      });
    }
  }

  loadMisEmpresas() {
    this.loading.set(true);
    
    // Si es admin, obtener todas las empresas. Si no, solo las propias
    const isAdmin = this.authService.user()?.role === 'admin';
    const request$ = isAdmin 
      ? this.empresasService.getAll() 
      : this.empresasService.getMisEmpresas();

    request$.subscribe({
      next: (data: Empresa[]) => {
        this.empresas.set(data);
        this.loading.set(false);
      },
      error: (err: any) => {
        console.error('Error al cargar empresas:', err);
        this.error.set('Error al cargar empresas');
        this.loading.set(false);
      }
    });
  }

  deleteEmpresa(id: number) {
    if (confirm('¿Estás seguro de eliminar esta empresa?')) {
      this.empresasService.delete(id).subscribe({
        next: () => {
          this.empresas.set(this.empresas().filter(e => e.id !== id));
        },
        error: (err: any) => this.error.set('Error al eliminar empresa')
      });
    }
  }
}
