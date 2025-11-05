import { Component, input } from '@angular/core';

@Component({
  selector: 'app-error-alert',
  standalone: true,
  templateUrl: './error-alert.component.html',
  styleUrl: './error-alert.component.css'
})
export class ErrorAlertComponent {
  message = input<string | null>(null);
}
