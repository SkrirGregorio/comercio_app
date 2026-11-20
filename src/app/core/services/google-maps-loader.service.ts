import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

/**
 * Carga la Maps JavaScript API bajo demanda usando el "dynamic library import"
 * recomendado por Google (loading=async + importLibrary). La API key y el Map ID
 * se toman de los archivos environment, no de index.html.
 */
@Injectable({ providedIn: 'root' })
export class GoogleMapsLoaderService {
  private loading?: Promise<void>;

  load(): Promise<void> {
    if (!this.loading) {
      this.loading = this.bootstrap().catch((err) => {
        this.loading = undefined; // permitir reintento
        throw err;
      });
    }
    return this.loading;
  }

  private async bootstrap(): Promise<void> {
    const w = window as any;
    if (!w.google?.maps?.importLibrary) {
      this.injectBootstrapLoader(environment.googleMapsApiKey);
    }
    await Promise.all([
      w.google.maps.importLibrary('maps'),
      w.google.maps.importLibrary('marker'),
      w.google.maps.importLibrary('places'),
    ]);
  }

  /** Versión mínima del bootstrap oficial: https://goo.gle/js-api-loading */
  private injectBootstrapLoader(key: string): void {
    const w = window as any;
    w.google = w.google || {};
    const maps = (w.google.maps = w.google.maps || {});
    const pending = new Set<string>();
    let scriptPromise: Promise<void> | undefined;

    const loadScript = () =>
      (scriptPromise ??= new Promise<void>((resolve, reject) => {
        const params = new URLSearchParams({
          key,
          v: 'weekly',
          loading: 'async',
          language: 'es',
          region: 'GT',
          libraries: [...pending].join(','),
          callback: 'google.maps.__ib__',
        });
        maps.__ib__ = resolve;
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?${params}`;
        script.async = true;
        script.onerror = () => reject(new Error('No se pudo cargar Google Maps JavaScript API'));
        document.head.append(script);
      }));

    maps.importLibrary = (name: string, ...rest: unknown[]) => {
      pending.add(name);
      // Tras cargar el script, Google reemplaza maps.importLibrary por la implementación real.
      return loadScript().then(() => maps.importLibrary(name, ...rest));
    };
  }
}
