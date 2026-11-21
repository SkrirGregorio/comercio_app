import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ServiciosService } from '../../../../core/services/servicios.service';
import type { Servicio } from '../../../../core/models/servicio.model';
import { IconComponent } from '../../../../shared/components/icon/icon.component';

/** Quita acentos y pasa a minúsculas para que "instalacion" encuentre "Instalación". */
function normalizar(texto: string | undefined): string {
  return (texto ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

@Component({
  selector: 'app-servicios-list',
  standalone: true,
  imports: [RouterLink, IconComponent],
  templateUrl: './servicios-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServiciosListComponent {
  private readonly serviciosSvc = inject(ServiciosService);

  readonly servicios = signal<Servicio[]>([]);
  readonly cargando = signal(true);
  readonly error = signal(false);
  readonly busqueda = signal('');

  /** El catálogo es pequeño: se carga una vez y se filtra en el navegador al escribir. */
  readonly filtrados = computed(() => {
    const q = normalizar(this.busqueda().trim());
    if (!q) return this.servicios();
    return this.servicios().filter(
      (s) =>
        normalizar(s.nombre).includes(q) ||
        normalizar(s.descripcion).includes(q) ||
        s.empresas?.some((e) => normalizar(e.nombre).includes(q)),
    );
  });

  readonly totalEmpresas = computed(
    () => new Set(this.servicios().flatMap((s) => s.empresas?.map((e) => e.id) ?? [])).size,
  );

  constructor() {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set(false);
    this.serviciosSvc.catalogo().subscribe({
      next: (servicios) => {
        this.servicios.set(servicios);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set(true);
        this.cargando.set(false);
      },
    });
  }

  onBuscar(event: Event): void {
    this.busqueda.set((event.target as HTMLInputElement).value);
  }

  avatar(nombre: string, url?: string): string {
    return url || `https://ui-avatars.com/api/?background=e5e7eb&color=111827&name=${encodeURIComponent(nombre)}`;
  }
}
