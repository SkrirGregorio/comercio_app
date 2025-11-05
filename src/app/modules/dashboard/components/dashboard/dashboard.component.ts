import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { Usuario } from '../../../../core/models/usuario.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet, RouterLinkActive],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  
  user = signal<Usuario | null>(null);
  activeTab = signal<string>('empresas');

  ngOnInit() {
    this.authService.profile().subscribe({
      next: (data: Usuario) => this.user.set(data),
      error: (err: any) => console.error('Error loading profile', err)
    });
  }

  setActiveTab(tab: string) {
    this.activeTab.set(tab);
  }
}
