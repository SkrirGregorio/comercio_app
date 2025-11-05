export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:3000',
  image: {
    maxAvatarMB: 2,
    maxPortadaMB: 5,
    maxPostMB: 3,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'] as const
  }
} as const;
