import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { EcommerceAuthService } from '../services/ecommerce-auth.service';

export const ecommerceAuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(EcommerceAuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  // Guardar la URL a la que intentaba acceder
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};
