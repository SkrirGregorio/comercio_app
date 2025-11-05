import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export type JsonRequestOptions = {
  headers?: HttpHeaders | { [header: string]: string | string[] };
  params?:
    | HttpParams
    | {
        [param: string]: string | number | boolean | readonly (string | number | boolean)[];
      };
  withCredentials?: boolean;
};

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBaseUrl;

  get<T>(endpoint: string, options: JsonRequestOptions = {}): Observable<T> {
    return this.http
      .get<T>(this.url(endpoint), options)
      .pipe(catchError(this.handleError));
  }

  post<T>(endpoint: string, body: unknown, options: JsonRequestOptions = {}): Observable<T> {
    return this.http
      .post<T>(this.url(endpoint), body, options)
      .pipe(catchError(this.handleError));
  }

  patch<T>(endpoint: string, body: unknown, options: JsonRequestOptions = {}): Observable<T> {
    return this.http
      .patch<T>(this.url(endpoint), body, options)
      .pipe(catchError(this.handleError));
  }

  delete<T>(endpoint: string, options: JsonRequestOptions = {}): Observable<T> {
    return this.http
      .delete<T>(this.url(endpoint), options)
      .pipe(catchError(this.handleError));
  }

  private url(endpoint: string): string {
    return endpoint.startsWith('http') ? endpoint : `${this.base}${endpoint}`;
  }

  private handleError(err: HttpErrorResponse) {
    const message = err.error?.message || err.statusText || 'Error de red';
    return throwError(() => ({ status: err.status, message, error: err.error }));
  }
}
