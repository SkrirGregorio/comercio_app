import { Component, EventEmitter, Input, Output, signal, AfterViewInit, OnDestroy, NgZone, inject, ChangeDetectionStrategy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../environments/environment';
import { GoogleMapsLoaderService } from '../../../core/services/google-maps-loader.service';

declare global {
  interface Window {
    google: any;
  }
}

@Component({
  selector: 'app-map-location-picker',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="map-picker-container">
      <!-- Buscador (PlaceAutocompleteElement de Places API New, se inserta en initMap) -->
      <div class="search-container mb-4">
        <div #searchHost class="pac-host"></div>
        @if (mapError()) {
          <p class="mt-2 text-sm text-red-600">{{ mapError() }}</p>
        }
      </div>

      <!-- Map Container -->
      <div #mapContainer class="map-container rounded-xl overflow-hidden border-2 border-gray-200"></div>

      <!-- Selected Coordinates Display -->
      @if (selectedLat() !== null && selectedLng() !== null) {
        <div class="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
          <div class="flex items-start gap-3">
            <div class="flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-green-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-green-900 mb-1">Ubicación seleccionada</p>
              <div class="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span class="text-green-700 font-medium">Latitud:</span>
                  <span class="text-green-900 ml-1">{{ selectedLat() | number:'1.6-6' }}</span>
                </div>
                <div>
                  <span class="text-green-700 font-medium">Longitud:</span>
                  <span class="text-green-900 ml-1">{{ selectedLng() | number:'1.6-6' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- Instructions -->
      <div class="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <div class="flex items-start gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div class="text-sm text-blue-900">
            <p class="font-medium mb-2">Cómo seleccionar la ubicación:</p>
            <ol class="list-decimal list-inside space-y-1 text-blue-800">
              <li>Usa la barra de búsqueda para encontrar tu ubicación</li>
              <li>Selecciona una opción de las sugerencias que aparecen</li>
              <li>O haz clic directamente en el mapa donde está tu negocio</li>
              <li>Puedes arrastrar el marcador para ajustar la ubicación exacta</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  styles: [`
    .map-container {
      width: 100%;
      height: 450px;
      background: #f3f4f6;
    }

    .search-container {
      position: relative;
      z-index: 1;
    }

    /* Web component gmp-place-autocomplete */
    :host ::ng-deep gmp-place-autocomplete {
      width: 100%;
      color-scheme: light;
      border: 2px solid #d1d5db;
      border-radius: 0.75rem;
    }
  `]
})
export class MapLocationPickerComponent implements AfterViewInit, OnDestroy {
  @Input() initialLat: number | null = null;
  @Input() initialLng: number | null = null;
  @Output() locationSelected = new EventEmitter<{ lat: number; lng: number }>();

  selectedLat = signal<number | null>(null);
  selectedLng = signal<number | null>(null);

  mapError = signal<string | null>(null);

  @ViewChild('mapContainer') private mapContainer?: ElementRef<HTMLElement>;
  @ViewChild('searchHost') private searchHost?: ElementRef<HTMLElement>;

  private map: any = null;
  private marker: any = null;
  private autocomplete: any = null;
  private ngZone = inject(NgZone);
  private mapsLoader = inject(GoogleMapsLoaderService);

  ngAfterViewInit() {
    this.mapsLoader
      .load()
      .then(() => this.initMap())
      .catch((err) => {
        console.error(err);
        this.mapError.set('No se pudo cargar Google Maps. Revisa tu conexión o la configuración de la API key.');
      });
  }

  ngOnDestroy() {
    if (this.marker) {
      this.marker.map = null;
    }
    if (this.map) {
      this.map = null;
    }
  }

  private initMap() {
    const mapContainer = this.mapContainer?.nativeElement;
    if (!mapContainer) return;

    // Centro por defecto: Jutiapa, Guatemala
    let center = { lat: 14.291667, lng: -89.895556 };

    // Si hay coordenadas iniciales, usarlas
    if (this.initialLat !== null && this.initialLng !== null) {
      center = { lat: this.initialLat, lng: this.initialLng };
      this.selectedLat.set(this.initialLat);
      this.selectedLng.set(this.initialLng);
      console.log('📍 Using initial coordinates:', center);
    }

    // Crear mapa
    this.map = new window.google.maps.Map(mapContainer, {
      center: center,
      zoom: 15,
      mapId: environment.googleMapsMapId,
      mapTypeControl: true,
      streetViewControl: false,
      fullscreenControl: true,
      zoomControl: true
    });

    console.log('✅ Map created');

    // Crear marcador
    this.marker = new window.google.maps.marker.AdvancedMarkerElement({
      map: this.map,
      position: center,
      gmpDraggable: true
    });

    console.log('✅ Marker created');

    // Buscador con PlaceAutocompleteElement (Places API New).
    // El widget legacy google.maps.places.Autocomplete ya no está disponible para proyectos nuevos.
    const searchHost = this.searchHost?.nativeElement;
    if (searchHost && window.google.maps.places?.PlaceAutocompleteElement) {
      this.ngZone.runOutsideAngular(() => {
        this.autocomplete = new window.google.maps.places.PlaceAutocompleteElement({
          includedRegionCodes: ['gt'],
          locationBias: center,
        });
        this.autocomplete.placeholder = 'Buscar ubicación (ej: Jutiapa, Guatemala)...';
        searchHost.replaceChildren(this.autocomplete);

        this.autocomplete.addEventListener('gmp-select', async (event: any) => {
          const place = event.placePrediction.toPlace();
          await place.fetchFields({ fields: ['displayName', 'formattedAddress', 'location'] });
          const location = place.location;
          if (!location) return;

          this.ngZone.run(() => {
            this.map.setCenter(location);
            this.map.setZoom(17);
            this.marker.position = location;
            this.updateSelectedLocation(location.lat(), location.lng());
          });
        });
      });
    }

    // Click en el mapa
    this.map.addListener('click', (event: any) => {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      
      this.marker.position = event.latLng;
      this.updateSelectedLocation(lat, lng);
    });

    // Arrastrar el marcador (position puede ser LatLng o LatLngLiteral)
    this.marker.addEventListener('gmp-dragend', () => {
      const position = this.marker.position;
      const lat = typeof position.lat === 'function' ? position.lat() : position.lat;
      const lng = typeof position.lng === 'function' ? position.lng() : position.lng;
      this.updateSelectedLocation(lat, lng);
    });
  }

  private updateSelectedLocation(lat: number, lng: number) {
    console.log('📝 updateSelectedLocation called with:', { lat, lng });
    this.selectedLat.set(lat);
    this.selectedLng.set(lng);
    console.log('📤 Emitting locationSelected event');
    this.locationSelected.emit({ lat, lng });
    console.log('✅ Signals updated:', {
      selectedLat: this.selectedLat(),
      selectedLng: this.selectedLng()
    });
  }

  public getSelectedLocation() {
    if (this.selectedLat() !== null && this.selectedLng() !== null) {
      return {
        lat: this.selectedLat()!,
        lng: this.selectedLng()!
      };
    }
    return null;
  }
}
