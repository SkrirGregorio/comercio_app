import { Component, input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-star-display',
  standalone: true,
  templateUrl: './star-display.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './star-display.component.css'
})
export class StarDisplayComponent {
  value = input<number>(0);
}
