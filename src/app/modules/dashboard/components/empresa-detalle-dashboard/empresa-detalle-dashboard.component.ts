import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EmpresasService } from '../../../../core/services/empresas.service';
import { PostsService } from '../../../../core/services/posts.service';
import { ServiciosService } from '../../../../core/services/servicios.service';
import { ResenasService } from '../../../../core/services/resenas.service';
import { Empresa } from '../../../../core/models/empresa.model';
import { Post } from '../../../../core/models/post.model';
import { Servicio } from '../../../../core/models/servicio.model';
import { Resena } from '../../../../core/models/resena.model';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorAlertComponent } from '../../../../shared/components/error-alert/error-alert.component';
import { StarDisplayComponent } from '../../../../shared/components/star-display/star-display.component';

@Component({
  selector: 'app-empresa-detalle-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingSpinnerComponent, ErrorAlertComponent, StarDisplayComponent],
  templateUrl: './empresa-detalle-dashboard.component.html',
  styleUrl: './empresa-detalle-dashboard.component.css'
})
export class EmpresaDetalleDashboardComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private empresasService = inject(EmpresasService);
  private postsService = inject(PostsService);
  private serviciosService = inject(ServiciosService);
  private resenasService = inject(ResenasService);

  empresa = signal<Empresa | null>(null);
  posts = signal<Post[]>([]);
  servicios = signal<Servicio[]>([]);
  resenas = signal<Resena[]>([]);
  loading = signal<boolean>(true);
  loadingPosts = signal<boolean>(true);
  loadingServicios = signal<boolean>(true);
  loadingResenas = signal<boolean>(true);
  error = signal<string>('');
  tab = signal<'posts' | 'servicios' | 'resenas'>('posts');
  empresaId: number = 0;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.empresaId = +id;
      this.loadEmpresa(this.empresaId);
      this.loadPosts(this.empresaId);
      this.loadServicios(this.empresaId);
      this.loadResenas(this.empresaId);
    }

    // Detectar tab desde query params
    this.route.queryParams.subscribe(params => {
      if (params['tab'] === 'servicios') {
        this.tab.set('servicios');
      } else if (params['tab'] === 'resenas') {
        this.tab.set('resenas');
      }
    });
  }

  loadEmpresa(id: number) {
    this.loading.set(true);
    this.empresasService.getById(id).subscribe({
      next: (data: Empresa) => {
        this.empresa.set(data);
        this.loading.set(false);
      },
      error: (err: any) => {
        this.error.set('Error al cargar empresa');
        this.loading.set(false);
      }
    });
  }

  loadPosts(empresaId: number) {
    this.loadingPosts.set(true);
    this.postsService.getByEmpresa(empresaId).subscribe({
      next: (data: Post[]) => {
        this.posts.set(data);
        this.loadingPosts.set(false);
      },
      error: (err: any) => {
        this.error.set('Error al cargar posts');
        this.loadingPosts.set(false);
      }
    });
  }

  loadServicios(empresaId: number) {
    this.loadingServicios.set(true);
    this.serviciosService.getByEmpresa(empresaId).subscribe({
      next: (data: Servicio[]) => {
        this.servicios.set(data);
        this.loadingServicios.set(false);
      },
      error: (err: any) => {
        this.error.set('Error al cargar servicios');
        this.loadingServicios.set(false);
      }
    });
  }

  loadResenas(empresaId: number) {
    this.loadingResenas.set(true);
    this.resenasService.getByEmpresa(empresaId).subscribe({
      next: (data: Resena[]) => {
        this.resenas.set(data);
        this.loadingResenas.set(false);
      },
      error: (err: any) => {
        this.error.set('Error al cargar reseñas');
        this.loadingResenas.set(false);
      }
    });
  }

  deletePost(postId: number) {
    if (confirm('¿Estás seguro de eliminar este post?')) {
      this.postsService.delete(postId).subscribe({
        next: () => {
          this.posts.set(this.posts().filter(p => p.id !== postId));
        },
        error: (err: any) => {
          this.error.set('Error al eliminar post');
        }
      });
    }
  }

  deleteServicio(servicioId: number) {
    if (confirm('¿Estás seguro de eliminar este servicio?')) {
      this.serviciosService.delete(servicioId).subscribe({
        next: () => {
          this.servicios.set(this.servicios().filter(s => s.id !== servicioId));
        },
        error: (err: any) => {
          this.error.set('Error al eliminar servicio');
        }
      });
    }
  }

  deleteResena(resenaId: number) {
    if (confirm('¿Estás seguro de eliminar esta reseña?')) {
      this.resenasService.delete(resenaId).subscribe({
        next: () => {
          this.resenas.set(this.resenas().filter(r => r.id !== resenaId));
        },
        error: (err: any) => {
          this.error.set('Error al eliminar reseña');
        }
      });
    }
  }

  goBack() {
    this.router.navigate(['/dashboard/empresas']);
  }
}
