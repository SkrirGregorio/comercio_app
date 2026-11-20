import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LEGAL } from '../../../../core/config/legal.config';
import { IconComponent } from '../../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-privacidad',
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent],
  templateUrl: './privacidad.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './privacidad.component.css'
})
export class PrivacidadComponent {
  readonly legal = LEGAL;
  readonly lastUpdate = LEGAL.ultimaActualizacion;
}
