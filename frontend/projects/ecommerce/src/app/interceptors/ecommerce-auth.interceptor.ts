import { HttpInterceptorFn, HttpErrorResponse, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { EcommerceAuthService } from '../services/ecommerce-auth.service';

export const ecommerceAuthInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(EcommerceAuthService);
  const token = authService.getToken();

  // Agregar token JWT si existe y es petición al ecommerce
  if (token && req.url.includes('/api/ecommerce/')) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Solo intentar refresh en rutas del ecommerce, excluyendo el propio refresh-token y login
      const isEcommerceReq = req.url.includes('/api/ecommerce/');
      const isAuthEndpoint = req.url.includes('/refresh-token') || req.url.includes('/login') || req.url.includes('/register');

      if (error.status === 401 && isEcommerceReq && !isAuthEndpoint) {
        const refreshToken = authService.getRefreshToken();

        if (refreshToken) {
          // Intentar renovar el JWT usando el refresh token
          return authService.refreshToken().pipe(
            switchMap(response => {
              // Reintentar la petición original con el nuevo token
              const retryReq = req.clone({
                setHeaders: { Authorization: `Bearer ${response.token}` }
              });
              return next(retryReq);
            }),
            catchError(refreshError => {
              // Si el refresh falla, cerrar sesión
              authService.logout();
              return throwError(() => refreshError);
            })
          );
        }

        // Sin refresh token disponible, cerrar sesión
        authService.logout();
      }

      return throwError(() => error);
    })
  );
};
