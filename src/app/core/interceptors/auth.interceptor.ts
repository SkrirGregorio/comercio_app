import { HttpInterceptorFn } from '@angular/common/http';
import { storage } from '../../shared/utils/storage';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = storage.token;
  const isApi = req.url.startsWith('http://') || req.url.startsWith('https://')
    ? req.url.startsWith(environment.apiBaseUrl)
    : true;

  const authReq = token && isApi
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq);
};
