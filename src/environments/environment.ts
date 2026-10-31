export const environment = {
  production: true,
  apiBaseUrl: 'http://136.111.42.49:3000',
  googleMapsApiKey: 'AIzaSyA78EEPq6tOPPkPRDvocl9bwTMXsFVlO-E', // Reemplaza con tu API key de Google Maps
  googleMapsMapId: 'DEMO_MAP_ID', // Requerido por AdvancedMarkerElement; reemplaza con tu Map ID de Google Cloud
  image: {
    maxAvatarMB: 2,
    maxPortadaMB: 5,
    maxPostMB: 3,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'] as const
  }
} as const;
