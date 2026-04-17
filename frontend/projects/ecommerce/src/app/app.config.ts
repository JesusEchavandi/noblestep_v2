import { ApplicationConfig, provideZoneChangeDetection, DEFAULT_CURRENCY_CODE, LOCALE_ID } from '@angular/core';
import { DATE_PIPE_DEFAULT_OPTIONS, registerLocaleData } from '@angular/common';
import localeEsPe from '@angular/common/locales/es-PE';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { interceptorAutenticacionEcommerce } from './interceptors/ecommerce-auth.interceptor';

registerLocaleData(localeEsPe);

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes),
    provideHttpClient(withInterceptors([interceptorAutenticacionEcommerce])),
    { provide: LOCALE_ID, useValue: 'es-PE' },
    { provide: DEFAULT_CURRENCY_CODE, useValue: 'PEN' },
    { provide: DATE_PIPE_DEFAULT_OPTIONS, useValue: { timezone: '-0500' } }
  ]
};
