import { Component, EventEmitter, Input, OnInit, Output, signal, AfterViewInit, OnDestroy, NgZone, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

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
      <!-- Search Box usando input tradicional -->
      <div class="search-container mb-4">
        <div class="relative">
          <input
            #searchInput
            type="text"
            id="pac-input"
            placeholder="Buscar ubicación (ej: Jutiapa, Guatemala)..."
            class="w-full px-4 py-3 pl-12 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <svg xmlns="http://www.w3.org/2000/svg" class="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
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

    /* Estilos para las sugerencias del autocomplete */
    :host ::ng-deep .pac-container {
      z-index: 9999 !important;
      border-radius: 8px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      margin-top: 4px;
    }

    :host ::ng-deep .pac-item {
      padding: 8px 12px;
      cursor: pointer;
    }

    :host ::ng-deep .pac-item:hover {
      background-color: #f3f4f6;
    }
  `]
})
export class MapLocationPickerComponent implements AfterViewInit, OnDestroy {
  @Input() initialLat: number | null = null;
  @Input() initialLng: number | null = null;
  @Output() locationSelected = new EventEmitter<{ lat: number; lng: number }>();

  selectedLat = signal<number | null>(null);
  selectedLng = signal<number | null>(null);

  private map: any = null;
  private marker: any = null;
  private autocomplete: any = null;
  private ngZone = inject(NgZone);

  ngAfterViewInit() {
    this.loadMap();
  }

  ngOnDestroy() {
    if (this.marker) {
      this.marker.setMap(null);
    }
    if (this.map) {
      this.map = null;
    }
  }

  private loadMap() {
    // Wait for Google Maps to be loaded
    const checkGoogleMaps = setInterval(() => {
      if (typeof window.google !== 'undefined' && window.google.maps) {
        clearInterval(checkGoogleMaps);
        this.initMap();
      }
    }, 100);
  }

  private initMap() {
    const mapContainer = document.querySelector('.map-container');
    const searchInput = document.querySelector('#pac-input') as HTMLInputElement;

    if (!mapContainer || !window.google) {
      console.error('❌ Map container or Google Maps not found');
      setTimeout(() => this.initMap(), 500);
      return;
    }

    console.log('✅ Initializing map...');

    // Default center (Lima, Peru)
    let center = { lat: -12.046374, lng: -77.042793 };

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
      mapTypeControl: true,
      streetViewControl: false,
      fullscreenControl: true,
      zoomControl: true
    });

    console.log('✅ Map created');

    // Crear marcador
    this.marker = new window.google.maps.Marker({
      map: this.map,
      position: center,
      draggable: true,
      animation: window.google.maps.Animation.DROP
    });

    console.log('✅ Marker created');

    // Setup Autocomplete en el input
    if (searchInput && window.google.maps.places) {
      this.ngZone.runOutsideAngular(() => {
        console.log('🔧 Setting up Autocomplete...');
        
        this.autocomplete = new window.google.maps.places.Autocomplete(searchInput, {
          fields: ['geometry', 'name', 'formatted_address'],
          types: ['geocode', 'establishment']
        });

        // Vincular al mapa
        this.autocomplete.bindTo('bounds', this.map);

        console.log('✅ Autocomplete created');

        // Escuchar cuando se selecciona un lugar
        this.autocomplete.addListener('place_changed', () => {
          console.log('🔵 Place changed event fired');
          
          this.ngZone.run(() => {
            const place = this.autocomplete.getPlace();
            console.log('📍 Place selected:', place);

            if (!place.geometry || !place.geometry.location) {
              console.log('❌ No geometry found for place');
              return;
            }

            const location = place.geometry.location;
            const lat = location.lat();
            const lng = location.lng();

            console.log('🎯 Coordinates extracted:', { lat, lng });

            // Centrar mapa
            this.map.setCenter(location);
            this.map.setZoom(17);
            
            // Mover marcador
            this.marker.setPosition(location);

            // Actualizar coordenadas
            this.updateSelectedLocation(lat, lng);

            console.log('✅ Map and marker updated from search');
          });
        });
      });
    } else {
      console.error('❌ Search input or Places API not found');
    }

    // Click en el mapa
    this.map.addListener('click', (event: any) => {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      
      this.marker.setPosition(event.latLng);
      this.updateSelectedLocation(lat, lng);
    });

    // Arrastrar el marcador
    this.marker.addListener('dragend', (event: any) => {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
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
