import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ResenasService } from '../../../../core/services/resenas.service';
import { Resena } from '../../../../core/models/resena.model';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { StarDisplayComponent } from '../../../../shared/components/star-display/star-display.component';

@Component({
  selector: 'app-mis-resenas',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingSpinnerComponent, StarDisplayComponent],
  templateUrl: './mis-resenas.component.html',
  styleUrl: './mis-resenas.component.css'
})
export class MisResenasComponent implements OnInit {
  private resenasService = inject(ResenasService);

  resenas = signal<Resena[]>([]);
  loading = signal<boolean>(true);
  error = signal<string>('');

  ngOnInit() {
    this.loadResenas();
  }

  loadResenas() {
    this.loading.set(true);
    this.resenasService.list().subscribe({
      next: (data: Resena[]) => {
        this.resenas.set(data);
        this.loading.set(false);
      },
      error: (err: any) => {
        this.error.set('Error al cargar reseñas');
        this.loading.set(false);
      }
    });
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

  getPromedioCalificacion(): number {
    const resenas = this.resenas();
    if (resenas.length === 0) return 0;
    const total = resenas.reduce((acc, r) => acc + r.calificacion, 0);
    return total / resenas.length;
  }

  getResenasCincoEstrellas(): number {
    return this.resenas().filter(r => r.calificacion === 5).length;
  }
}
