export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:3000',
  // Key de navegador: restringirla por referrer HTTP (localhost:4200 y el dominio de producción)
  // y por API (Maps JavaScript API + Places API (New)) en Google Cloud Console.
  googleMapsApiKey: 'AIzaSyA78EEPq6tOPPkPRDvocl9bwTMXsFVlO-E',
  googleMapsMapId: 'DEMO_MAP_ID', // Requerido por AdvancedMarkerElement; DEMO_MAP_ID sirve en desarrollo
  image: {
    maxAvatarMB: 2,
    maxPortadaMB: 5,
    maxPostMB: 3,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'] as const
  }
} as const;
