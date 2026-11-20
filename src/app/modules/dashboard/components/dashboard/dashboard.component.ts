import { Component, computed, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';

import { RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, RouterOutlet, RouterLinkActive],
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  
  // El authGuard ya cargó el perfil antes de entrar al panel
  readonly user = this.authService.user;
  readonly esPropietario = computed(() => ['propietario', 'admin'].includes(this.user()?.role ?? ''));
  activeTab = signal<string>('empresas');

  ngOnInit() {}

  setActiveTab(tab: string) {
    this.activeTab.set(tab);
  }
}
