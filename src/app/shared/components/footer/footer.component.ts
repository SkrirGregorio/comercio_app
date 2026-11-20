import { NgOptimizedImage } from '@angular/common';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent, type IconName } from '../icon/icon.component';

interface RedSocial {
  nombre: string;
  icono: IconName;
  /** URL del perfil. Vacía mientras no exista: el icono se muestra pero no navega. */
  url: string;
}

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [NgOptimizedImage, RouterLink, IconComponent],
  templateUrl: './footer.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  readonly year = new Date().getFullYear();

  // TODO: completar las URL cuando se creen los perfiles oficiales.
  readonly redes: RedSocial[] = [
    { nombre: 'Facebook', icono: 'brand-facebook', url: '' },
    { nombre: 'Instagram', icono: 'brand-instagram', url: '' },
    { nombre: 'X (Twitter)', icono: 'brand-x', url: '' },
  ];
}
