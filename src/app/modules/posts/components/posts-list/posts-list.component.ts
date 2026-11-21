import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PostsService } from '../../../../core/services/posts.service';
import type { Post } from '../../../../core/models/post.model';
import { IconComponent } from '../../../../shared/components/icon/icon.component';

const POR_PAGINA = 10;
/** Contenido más largo que esto se recorta con "Ver más". */
const LARGO_RESUMEN = 280;

const relativo = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });
const UNIDADES: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 31_536_000],
  ['month', 2_592_000],
  ['week', 604_800],
  ['day', 86_400],
  ['hour', 3_600],
  ['minute', 60],
];

/**
 * Feed público de publicaciones, estilo red social. Carga de 10 en 10 con paginación
 * por cursor: un IntersectionObserver vigila un elemento al final de la lista y pide
 * la siguiente página antes de que el usuario llegue al final.
 */
@Component({
  selector: 'app-posts-list',
  standalone: true,
  imports: [DatePipe, RouterLink, IconComponent],
  templateUrl: './posts-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostsListComponent {
  private readonly postsSvc = inject(PostsService);
  private readonly centinela = viewChild<ElementRef<HTMLElement>>('centinela');

  readonly posts = signal<Post[]>([]);
  readonly cargando = signal(false);
  readonly error = signal(false);
  readonly fin = signal(false);
  readonly expandidos = signal<ReadonlySet<number>>(new Set());

  private cursor: number | null = null;
  private observer?: IntersectionObserver;

  readonly largoResumen = LARGO_RESUMEN;

  constructor() {
    this.cargarMas();

    afterNextRender(() => {
      const el = this.centinela()?.nativeElement;
      if (!el || typeof IntersectionObserver === 'undefined') return;
      // rootMargin: empieza a cargar ~800px antes de llegar al final
      this.observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) this.cargarMas();
        },
        { rootMargin: '800px 0px' },
      );
      this.observer.observe(el);
    });

    inject(DestroyRef).onDestroy(() => this.observer?.disconnect());
  }

  cargarMas(): void {
    if (this.cargando() || this.fin()) return;
    this.cargando.set(true);
    this.error.set(false);

    this.postsSvc.feed(POR_PAGINA, this.cursor).subscribe({
      next: ({ items, nextCursor }) => {
        this.posts.update((actuales) => [...actuales, ...items]);
        this.cursor = nextCursor;
        this.fin.set(nextCursor === null);
        this.cargando.set(false);
        this.revisarCentinela();
      },
      error: () => {
        this.error.set(true);
        this.cargando.set(false);
      },
    });
  }

  /**
   * Si tras cargar una página el final sigue visible (pantallas altas o pocos posts),
   * el observer no vuelve a disparar porque no hubo cambio; se le fuerza a reevaluar.
   */
  private revisarCentinela(): void {
    const el = this.centinela()?.nativeElement;
    if (!this.observer || !el || this.fin()) return;
    this.observer.unobserve(el);
    this.observer.observe(el);
  }

  alternar(id: number): void {
    this.expandidos.update((set) => {
      const nuevo = new Set(set);
      if (nuevo.has(id)) nuevo.delete(id);
      else nuevo.add(id);
      return nuevo;
    });
  }

  hace(fecha?: string | Date): string {
    if (!fecha) return '';
    const segundos = (new Date(fecha).getTime() - Date.now()) / 1000;
    for (const [unidad, s] of UNIDADES) {
      if (Math.abs(segundos) >= s) return relativo.format(Math.round(segundos / s), unidad);
    }
    return 'justo ahora';
  }

  avatar(nombre = '', url?: string): string {
    return url || `https://ui-avatars.com/api/?background=e5e7eb&color=111827&name=${encodeURIComponent(nombre)}`;
  }
}
