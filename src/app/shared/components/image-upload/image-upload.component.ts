import { Component, EventEmitter, Output, input, signal, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { validateImage } from '../../utils/image';
import { UploadService } from '../../../core/services/upload.service';

export interface UploadResult { url: string; filename: string; }
export type UploadType = 'avatar' | 'portada' | 'post';

@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image-upload.component.html',
  styleUrl: './image-upload.component.css'
})
export class ImageUploadComponent {
  private uploadService = inject(UploadService);

  // Inputs
  accept = input<string>('image/jpeg,image/png,image/webp');
  maxMB = input<number>(2);
  type = input<UploadType>('avatar');
  currentImage = input<string>('');
  autoUpload = input<boolean>(true); // Si es true, sube automáticamente al seleccionar
  label = input<string>('Seleccionar imagen');

  // Signals
  progress = signal(0);
  error = signal<string | null>(null);
  preview = signal<string | null>(null);
  uploading = signal(false);
  uploadedUrl = signal<string>('');

  // Outputs
  @Output() fileSelected = new EventEmitter<File>();
  @Output() uploadComplete = new EventEmitter<UploadResult>();
  @Output() uploadError = new EventEmitter<string>();

  constructor() {
    effect(() => {
      const current = this.currentImage();
      if (current) {
        this.preview.set(current);
        this.uploadedUrl.set(current);
      }
    });
  }

  onFileSelect(evt: Event) {
    const input = evt.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const err = validateImage(file, this.maxMB());
    if (err) { 
      this.error.set(err);
      this.uploadError.emit(err);
      return; 
    }
    this.error.set(null);

    const reader = new FileReader();
    reader.onload = () => this.preview.set(reader.result as string);
    reader.readAsDataURL(file);

    this.fileSelected.emit(file);

    // Si autoUpload está activado, subir automáticamente
    if (this.autoUpload()) {
      this.uploadFile(file);
    }
  }

  uploadFile(file: File) {
    this.uploading.set(true);
    this.progress.set(0);
    this.error.set(null);

    const uploadMethod = this.type() === 'avatar' 
      ? this.uploadService.uploadAvatar(file)
      : this.type() === 'portada'
      ? this.uploadService.uploadPortada(file)
      : this.uploadService.uploadPostImage(file);

    uploadMethod.subscribe({
      next: (result) => {
        this.progress.set(result.progress);
        
        if (result.done) {
          this.uploading.set(false);
          this.uploadedUrl.set(result.done.url);
          this.uploadComplete.emit({
            url: result.done.url,
            filename: result.done.filename
          });
          console.log('✅ Imagen subida:', result.done);
        }
      },
      error: (err: any) => {
        this.uploading.set(false);
        this.progress.set(0);
        const message = err.error?.message || 'Error al subir la imagen';
        this.error.set(message);
        this.uploadError.emit(message);
        console.error('❌ Error al subir imagen:', err);
      }
    });
  }

  removeImage() {
    this.preview.set(null);
    this.uploadedUrl.set('');
    this.progress.set(0);
    this.error.set(null);
    this.uploadComplete.emit({ url: '', filename: '' });
  }

  setProgress(v: number) { this.progress.set(v); }
  
  clear() { 
    this.progress.set(0); 
    this.preview.set(null); 
    this.error.set(null); 
    this.uploadedUrl.set('');
    this.uploading.set(false);
  }

  getMaxSizeText(): string {
    return `${this.maxMB()}MB`;
  }
}
