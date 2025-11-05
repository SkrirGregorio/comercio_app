import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-privacidad',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './privacidad.component.html',
  styleUrl: './privacidad.component.css'
})
export class PrivacidadComponent {
  lastUpdate = new Date('2025-11-04');
}
