import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface UploadResponse {
  filename: string;
  originalName: string;
  size: number;
  mimetype: string;
  url: string;
}

@Injectable({ providedIn: 'root' })
export class UploadService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBaseUrl;

  private upload(endpoint: string, file: File): Observable<{ progress: number; done?: UploadResponse }>{
    const form = new FormData();
    form.append('file', file);
    return this.http.post<UploadResponse>(`${this.base}${endpoint}`, form, {
      reportProgress: true,
      observe: 'events'
    }).pipe(
      map((event: HttpEvent<UploadResponse>) => {
        switch (event.type) {
          case HttpEventType.UploadProgress:
            const progress = event.total ? Math.round(100 * (event.loaded / event.total)) : 0;
            return { progress };
          case HttpEventType.Response:
            return { progress: 100, done: event.body! };
          default:
            return { progress: 0 };
        }
      })
    );
  }

  uploadAvatar(file: File) { return this.upload('/upload/avatar', file); }
  uploadPortada(file: File) { return this.upload('/upload/portada', file); }
  uploadPostImage(file: File) { return this.upload('/upload/post-image', file); }

  deleteImage(filename: string) {
    return this.http.delete<void>(`${this.base}/upload/image/${encodeURIComponent(filename)}`);
  }
}
