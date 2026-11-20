import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LEGAL } from '../../../../core/config/legal.config';

@Component({
  selector: 'app-terminos',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './terminos.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './terminos.component.css'
})
export class TerminosComponent {
  readonly legal = LEGAL;
  readonly lastUpdate = LEGAL.ultimaActualizacion;
}
