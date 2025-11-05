import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-terminos',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './terminos.component.html',
  styleUrl: './terminos.component.css'
})
export class TerminosComponent {
  lastUpdate = new Date('2025-11-04');
}
