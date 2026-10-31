export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:3000',
  googleMapsMapId: 'DEMO_MAP_ID', // Requerido por AdvancedMarkerElement; reemplaza con tu Map ID de Google Cloud
  image: {
    maxAvatarMB: 2,
    maxPortadaMB: 5,
    maxPostMB: 3,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'] as const
  }
} as const;
