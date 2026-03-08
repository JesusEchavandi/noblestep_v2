import { HttpInterceptorFn, HttpErrorResponse, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { EcommerceAuthService } from '../services/ecommerce-auth.service';

export const interceptorAutenticacionEcommerce: HttpInterceptorFn = (req, next) => {
  const authService = inject(EcommerceAuthService);
  const token = authService.obtenerToken();

  // Agregar token JWT si existe y es petición al ecommerce
  if (token && req.url.includes('/api/ecommerce/')) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Solo intentar refresh en rutas del ecommerce, excluyendo el propio refresh-token y login
      const esReqEcommerce = req.url.includes('/api/ecommerce/');
      const esEndpointAuth = req.url.includes('/refresh-token') || req.url.includes('/login') || req.url.includes('/register');

      if (error.status === 401 && esReqEcommerce && !esEndpointAuth) {
        const tokenRefresco = authService.obtenerRefreshToken();

        if (tokenRefresco) {
          // Intentar renovar el JWT usando el refresh token
          return authService.refrescarToken().pipe(
            switchMap(respuesta => {
              // Reintentar la petición original con el nuevo token
              const reqReintento = req.clone({
                setHeaders: { Authorization: `Bearer ${respuesta.token}` }
              });
              return next(reqReintento);
            }),
            catchError(errorRefresco => {
              // Si el refresh falla, cerrar sesión
              authService.cerrarSesion();
              return throwError(() => errorRefresco);
            })
          );
        }

        // Sin refresh token disponible, cerrar sesión
        authService.cerrarSesion();
      }

      return throwError(() => error);
    })
  );
};
