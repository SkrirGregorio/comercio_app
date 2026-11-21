import { DestroyRef, Injectable, inject } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { SwUpdate, type VersionReadyEvent } from '@angular/service-worker';
import { filter, interval } from 'rxjs';

/** Cada cuánto se pregunta al servidor si hay una versión nueva (pestañas abiertas mucho tiempo). */
const REVISAR_CADA_MS = 15 * 60 * 1000;

/**
 * Mantiene la PWA al día. Sin esto, el service worker sigue sirviendo la versión
 * guardada hasta que se cierran todas las pestañas, y tras un despliegue los usuarios
 * no ven los cambios.
 *
 * Cuando la nueva versión ya está descargada, se aplica en la siguiente navegación
 * interna con una carga completa de la página de destino. Así no se recarga en medio
 * de un formulario a medio llenar.
 */
@Injectable({ providedIn: 'root' })
export class AppUpdateService {
  private readonly swUpdate = inject(SwUpdate);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private listaParaActualizar = false;

  init(): void {
    if (!this.swUpdate.isEnabled) return;

    this.swUpdate.versionUpdates
      .pipe(filter((e): e is VersionReadyEvent => e.type === 'VERSION_READY'))
      .subscribe(() => (this.listaParaActualizar = true));

    // Si la versión guardada quedó inservible (archivos ya borrados del servidor)
    this.swUpdate.unrecoverable.subscribe(() => document.location.reload());

    this.router.events
      .pipe(filter((e): e is NavigationStart => e instanceof NavigationStart))
      .subscribe((e) => {
        if (this.listaParaActualizar) {
          this.listaParaActualizar = false;
          document.location.assign(e.url);
        }
      });

    const sub = interval(REVISAR_CADA_MS).subscribe(() => {
      this.swUpdate.checkForUpdate().catch(() => undefined);
    });
    this.destroyRef.onDestroy(() => sub.unsubscribe());
  }
}
