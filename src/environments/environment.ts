export const environment = {
  production: true,
  apiBaseUrl: 'http://localhost:3000',
  googleMapsApiKey: 'AIzaSyA78EEPq6tOPPkPRDvocl9bwTMXsFVlO-E', // Reemplaza con tu API key de Google Maps
  image: {
    maxAvatarMB: 2,
    maxPortadaMB: 5,
    maxPostMB: 3,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'] as const
  }
} as const;
