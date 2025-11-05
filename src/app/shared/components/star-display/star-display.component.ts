import { Component, input } from '@angular/core';

@Component({
  selector: 'app-star-display',
  standalone: true,
  templateUrl: './star-display.component.html',
  styleUrl: './star-display.component.css'
})
export class StarDisplayComponent {
  value = input<number>(0);
}
