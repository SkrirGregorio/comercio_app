import { Component, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import type { Empresa } from '../../../../core/models/empresa.model';
import { RouterLink } from '@angular/router';
import { StarDisplayComponent } from '../../../../shared/components/star-display/star-display.component';

@Component({
  selector: 'app-empresa-card',
  standalone: true,
  imports: [RouterLink, StarDisplayComponent],
  templateUrl: './empresa-card.component.html',
  styleUrl: './empresa-card.component.css'
})
export class EmpresaCardComponent {
  empresa = input.required<Empresa>();

  promedioCalificacion(): number {
    const resenas = this.empresa().resenas;
    if (!resenas || resenas.length === 0) {
      return 0;
    }
    const total = resenas.reduce((acc, r) => acc + r.calificacion, 0);
    return total / resenas.length;
  }
}
