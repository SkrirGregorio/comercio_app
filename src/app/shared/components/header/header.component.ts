import { Component, inject, signal, WritableSignal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgOptimizedImage],
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private document = inject(DOCUMENT);

  isAuthed = this.authService.isAuthenticated;
  mobileOpen: WritableSignal<boolean> = signal(false);

  constructor() {
    // Asegura que el tema se aplique al cargar la página
    if (localStorage.getItem('theme') === 'dark' || 
       (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      this.document.documentElement.classList.add('dark');
    } else {
      this.document.documentElement.classList.remove('dark');
    }
  }

  toggleMobile(): void {
    this.mobileOpen.update(value => !value);
  }

  toggleTheme(): void {
    const isDark = this.document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
