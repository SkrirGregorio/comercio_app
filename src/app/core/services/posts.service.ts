import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Post, CreatePostDto, UpdatePostDto, PostsFeed } from '../models/post.model';

@Injectable({
  providedIn: 'root'
})
export class PostsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiBaseUrl}/posts`;

  /**
   * Obtener todos los posts
   */
  list(): Observable<Post[]> {
    return this.http.get<Post[]>(this.apiUrl);
  }

  /**
   * Feed público paginado por cursor (más recientes primero).
   * Para la siguiente página se envía el `nextCursor` de la respuesta anterior.
   */
  feed(limit = 10, cursor?: number | null): Observable<PostsFeed> {
    let params = new HttpParams().set('limit', limit);
    if (cursor) params = params.set('cursor', cursor);
    return this.http.get<PostsFeed>(`${this.apiUrl}/feed`, { params });
  }

  /**
   * Obtener posts de una empresa específica
   */
  getByEmpresa(empresaId: number): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.apiUrl}/empresa/${empresaId}`);
  }

  /**
   * Obtener un post por ID
   */
  get(id: number): Observable<Post> {
    return this.http.get<Post>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crear un nuevo post
   */
  create(data: CreatePostDto): Observable<Post> {
    return this.http.post<Post>(this.apiUrl, data);
  }

  /**
   * Actualizar un post
   */
  update(id: number, data: UpdatePostDto): Observable<Post> {
    return this.http.patch<Post>(`${this.apiUrl}/${id}`, data);
  }

  /**
   * Eliminar un post
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Alias methods para compatibilidad
  getAll(): Observable<Post[]> {
    return this.list();
  }

  getById(id: number): Observable<Post> {
    return this.get(id);
  }
}
