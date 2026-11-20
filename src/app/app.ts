import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('01-app-comercio');
  private readonly auth = inject(AuthService);

  ngOnInit(): void {
    this.auth.loadProfile().subscribe({ error: () => {} });
  }
}
