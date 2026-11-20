import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LEGAL } from '../../../../core/config/legal.config';
import { IconComponent } from '../../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-terminos',
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent],
  templateUrl: './terminos.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './terminos.component.css'
})
export class TerminosComponent {
  readonly legal = LEGAL;
  readonly lastUpdate = LEGAL.ultimaActualizacion;
}
