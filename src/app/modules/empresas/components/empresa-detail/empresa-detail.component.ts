import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AsyncPipe, DatePipe } from '@angular/common';
import { EmpresasService } from '../../../../core/services/empresas.service';
import { switchMap } from 'rxjs/operators';
import { StarDisplayComponent } from '../../../../shared/components/star-display/star-display.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import type { Resena } from '../../../../core/models/resena.model';

@Component({
  selector: 'app-empresa-detail',
  standalone: true,
  imports: [AsyncPipe, DatePipe, StarDisplayComponent, LoadingSpinnerComponent],
  templateUrl: './empresa-detail.component.html',
  styleUrl: './empresa-detail.component.css'
})
export class EmpresaDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly empresas = inject(EmpresasService);

  readonly tab = signal<'posts' | 'servicios' | 'resenas'>('posts');

  readonly vm$ = this.route.paramMap.pipe(
    switchMap((params) => this.empresas.get(Number(params.get('id'))))
  );

  promedioCalificacion(resenas: Resena[]): number {
    if (!resenas || resenas.length === 0) {
      return 0;
    }
    const total = resenas.reduce((acc, r) => acc + r.calificacion, 0);
    return total / resenas.length;
  }
}
