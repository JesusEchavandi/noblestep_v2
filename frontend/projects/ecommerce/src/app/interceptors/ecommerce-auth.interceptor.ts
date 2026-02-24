import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { EcommerceAuthService } from '../services/ecommerce-auth.service';

export const ecommerceAuthInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(EcommerceAuthService);
  const router = inject(Router);
  const token = authService.getToken();

  // Solo agregar el token si es una petición a nuestra API de e-commerce
  if (token && req.url.includes('/api/ecommerce/')) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && req.url.includes('/api/ecommerce/')) {
        // Token expirado o inválido — limpiar sesión y redirigir
        authService.logout();
        router.navigate(['/login'], { queryParams: { expired: 'true' } });
      }
      return throwError(() => error);
    })
  );
};
