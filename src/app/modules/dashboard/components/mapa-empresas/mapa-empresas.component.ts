import { Component, inject, OnInit, signal, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmpresasService } from '../../../../core/services/empresas.service';
import { Empresa } from '../../../../core/models/empresa.model';
import { Router } from '@angular/router';
import { environment } from '../../../../../environments/environment';

declare global {
  interface Window {
    google: any;
  }
}

interface EmpresaWithDistance extends Empresa {
  distance?: number;
}

@Component({
  selector: 'app-mapa-empresas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mapa-empresas.component.html',
  styleUrl: './mapa-empresas.component.css'
})
export class MapaEmpresasComponent implements OnInit, AfterViewInit {
  private empresasService = inject(EmpresasService);
  private router = inject(Router);

  empresas = signal<EmpresaWithDistance[]>([]);
  empresasFiltered = signal<EmpresaWithDistance[]>([]);
  empresasDisplayed = signal<EmpresaWithDistance[]>([]); // Para búsqueda
  searchTerm = signal('');
  loading = signal(false);
  error = signal('');
  userLocation = signal<{ lat: number; lng: number } | null>(null);
  radiusKm = signal(10); // Radio de búsqueda en km
  
  private map: any = null;
  private markers: any[] = [];
  private userMarker: any = null;

  ngOnInit() {
    this.loadEmpresas();
    this.getUserLocation();
  }

  ngAfterViewInit() {
    setTimeout(() => this.initMap(), 500);
  }

  getUserLocation() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.userLocation.set({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          this.filterEmpresasByDistance();
          this.updateMapCenter();
        },
        (error) => {
          console.warn('No se pudo obtener la ubicación del usuario:', error);
          // Usar ubicación por defecto (Lima, Peru)
          this.userLocation.set({ lat: -12.046374, lng: -77.042793 });
        }
      );
    } else {
      this.userLocation.set({ lat: -12.046374, lng: -77.042793 });
    }
  }

  loadEmpresas() {
    this.loading.set(true);
    this.empresasService.getAll().subscribe({
      next: (empresas: Empresa[]) => {
        // Filtrar solo empresas con coordenadas
        const empresasConUbicacion = empresas.filter(e => e.latitud && e.longitud);
        this.empresas.set(empresasConUbicacion);
        this.filterEmpresasByDistance();
        this.loading.set(false);
        this.updateMapMarkers();
      },
      error: (err: any) => {
        this.error.set('Error al cargar las empresas');
        this.loading.set(false);
      }
    });
  }

  filterEmpresasByDistance() {
    const userLoc = this.userLocation();
    if (!userLoc) {
      this.empresasFiltered.set(this.empresas());
      this.applySearchFilter();
      return;
    }

    const empresasWithDist = this.empresas().map(empresa => {
      if (empresa.latitud && empresa.longitud) {
        // Convertir coordenadas a números
        const lat = Number(empresa.latitud);
        const lng = Number(empresa.longitud);
        
        // Validar coordenadas
        if (!isNaN(lat) && !isNaN(lng)) {
          const distance = this.calculateDistance(
            userLoc.lat,
            userLoc.lng,
            lat,
            lng
          );
          return { ...empresa, distance };
        }
      }
      return empresa;
    });

    // Filtrar por radio
    const filtered = empresasWithDist
      .filter(e => !e.distance || e.distance <= this.radiusKm())
      .sort((a, b) => (a.distance || 0) - (b.distance || 0));

    this.empresasFiltered.set(filtered);
    this.applySearchFilter();
  }

  onSearchChange(term: string) {
    this.searchTerm.set(term);
    this.applySearchFilter();
  }

  applySearchFilter() {
    const term = this.searchTerm().toLowerCase().trim();
    
    if (!term) {
      this.empresasDisplayed.set(this.empresasFiltered());
      return;
    }

    const filtered = this.empresasFiltered().filter(empresa =>
      empresa.nombre.toLowerCase().includes(term) ||
      empresa.descripcion?.toLowerCase().includes(term) ||
      empresa.direccion.toLowerCase().includes(term)
    );

    this.empresasDisplayed.set(filtered);
  }

  calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    // Fórmula de Haversine para calcular distancia entre dos puntos
    const R = 6371; // Radio de la Tierra en km
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  onRadiusChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.radiusKm.set(Number(select.value));
    this.filterEmpresasByDistance();
  }

  // Google Maps Methods
  private initMap() {
    const mapContainer = document.querySelector('#map-container');
    if (!mapContainer || !window.google) {
      setTimeout(() => this.initMap(), 500);
      return;
    }

    const center = this.userLocation() || { lat: -12.046374, lng: -77.042793 };

    this.map = new window.google.maps.Map(mapContainer, {
      center: center,
      zoom: 13,
      mapId: environment.googleMapsMapId,
      mapTypeControl: true,
      streetViewControl: false,
      fullscreenControl: true,
      zoomControl: true
    });

    this.updateMapMarkers();
    this.addUserMarker();
  }

  private updateMapCenter() {
    if (this.map && this.userLocation()) {
      this.map.setCenter(this.userLocation());
      this.addUserMarker();
    }
  }

  private addUserMarker() {
    if (!this.map || !this.userLocation()) return;

    // Remover marcador anterior
    if (this.userMarker) {
      this.userMarker.map = null;
    }

    // Punto azul del usuario (centrado sobre la posición)
    const dot = document.createElement('div');
    dot.style.cssText = 'width:20px;height:20px;border-radius:50%;background:#3B82F6;border:3px solid #FFFFFF;box-shadow:0 1px 4px rgba(0,0,0,.3);transform:translateY(50%);';

    // Crear marcador del usuario
    this.userMarker = new window.google.maps.marker.AdvancedMarkerElement({
      map: this.map,
      position: this.userLocation(),
      content: dot,
      title: 'Tu ubicación',
      gmpClickable: true
    });

    // Info window para el usuario
    const infoWindow = new window.google.maps.InfoWindow({
      content: '<div class="p-2"><strong>Tu ubicación</strong></div>'
    });

    this.userMarker.addEventListener('gmp-click', () => {
      infoWindow.open({ map: this.map, anchor: this.userMarker });
    });
  }

  private updateMapMarkers() {
    if (!this.map) return;

    // Limpiar marcadores anteriores
    this.markers.forEach(marker => marker.map = null);
    this.markers = [];

    // Agregar marcadores de empresas
    this.empresasFiltered().forEach((empresa, index) => {
      if (empresa.latitud && empresa.longitud) {
        // Convertir coordenadas a números
        const lat = Number(empresa.latitud);
        const lng = Number(empresa.longitud);
        
        // Validar que las coordenadas son números válidos
        if (isNaN(lat) || isNaN(lng)) {
          console.warn(`⚠️ Coordenadas inválidas para empresa ${empresa.nombre}:`, empresa.latitud, empresa.longitud);
          return;
        }

        const marker = new window.google.maps.marker.AdvancedMarkerElement({
          map: this.map,
          position: { lat, lng },
          title: empresa.nombre,
          content: this.createAvatarMarkerContent(empresa),
          gmpClickable: true
        });

        // Guardar referencia al ID de la empresa
        (marker as any).empresaId = empresa.id;

        // Info window con avatar
        const infoContent = `
          <div class="p-3 max-w-xs">
            <div class="flex items-start gap-3">
              <img src="${empresa.urlAvatar || '/assets/default-business.svg'}" 
                   alt="${empresa.nombre}" 
                   class="w-12 h-12 rounded-full object-cover bg-gray-100"
                   onerror="this.src='/assets/default-business.svg'">
              <div class="flex-1">
                <h3 class="font-bold text-gray-900 mb-1">${empresa.nombre}</h3>
                <p class="text-sm text-gray-600 mb-2">${empresa.descripcion}</p>
                ${empresa.distance ? `<p class="text-xs text-blue-600 font-medium">📍 ${empresa.distance.toFixed(2)} km de distancia</p>` : ''}
                <a href="/empresas/${empresa.id}" class="text-sm text-blue-600 hover:underline mt-2 inline-block">Ver detalles →</a>
              </div>
            </div>
          </div>
        `;

        const infoWindow = new window.google.maps.InfoWindow({
          content: infoContent
        });

        marker.addEventListener('gmp-click', () => {
          // Cerrar otras info windows
          this.markers.forEach(m => {
            if (m.infoWindow) m.infoWindow.close();
          });
          infoWindow.open({ map: this.map, anchor: marker });
        });

        marker.infoWindow = infoWindow;
        this.markers.push(marker);
      }
    });
  }

  // Avatar circular de la empresa como contenido del marcador, con animación de caída
  private createAvatarMarkerContent(empresa: Empresa): HTMLElement {
    const img = document.createElement('img');
    img.src = empresa.urlAvatar || '/assets/default-business.svg';
    img.alt = empresa.nombre;
    img.style.cssText = 'width:40px;height:40px;border-radius:50%;object-fit:cover;background:#F3F4F6;border:2px solid #FFFFFF;box-shadow:0 1px 4px rgba(0,0,0,.3);';
    img.onerror = () => {
      img.onerror = null;
      img.src = '/assets/default-business.svg';
    };
    img.animate(
      [{ transform: 'translateY(-200px)', opacity: 0 }, { transform: 'translateY(0)', opacity: 1 }],
      { duration: 400, easing: 'ease-out' }
    );
    return img;
  }

  viewEmpresaDetail(empresaId: number) {
    this.router.navigate(['/empresas', empresaId]);
  }

  centerOnEmpresa(empresa: EmpresaWithDistance) {
    if (this.map && empresa.latitud && empresa.longitud) {
      // Convertir coordenadas a números
      const lat = Number(empresa.latitud);
      const lng = Number(empresa.longitud);
      
      // Validar coordenadas
      if (isNaN(lat) || isNaN(lng)) {
        console.warn('⚠️ Coordenadas inválidas al centrar en empresa:', empresa.latitud, empresa.longitud);
        return;
      }
      
      this.map.setCenter({ lat, lng });
      this.map.setZoom(16);
      
      // Buscar el marcador por ID de empresa en lugar de coordenadas
      const marker = this.markers.find(m => {
        const empresaId = (m as any).empresaId;
        return empresaId === empresa.id;
      });
      
      if (marker && marker.infoWindow) {
        // Cerrar todas las ventanas de información abiertas
        this.markers.forEach(m => {
          if (m.infoWindow) m.infoWindow.close();
        });
        // Abrir la ventana de información del marcador seleccionado
        marker.infoWindow.open({ map: this.map, anchor: marker });
      }
    }
  }
}
