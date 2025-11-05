import { environment } from '../../../environments/environment';

export function validateImage(file: File, maxMB: number, types = environment.image.allowedTypes): string | null {
  if (!types.includes(file.type as any)) return 'Formato no permitido. Solo JPG, PNG o WebP.';
  const sizeMB = file.size / (1024 * 1024);
  if (sizeMB > maxMB) return `La imagen supera el máximo permitido (${maxMB} MB).`;
  return null;
}
