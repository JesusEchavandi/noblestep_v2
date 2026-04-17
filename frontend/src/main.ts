import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app/app.routes';
import { interceptorAutenticacion } from './app/auth/auth.interceptor';
import { LOCALE_ID, DEFAULT_CURRENCY_CODE } from '@angular/core';
import { registerLocaleData, DATE_PIPE_DEFAULT_OPTIONS } from '@angular/common';
import localeEsPe from '@angular/common/locales/es-PE';

// Registrar datos del idioma español (Perú)
registerLocaleData(localeEsPe);

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([interceptorAutenticacion])),
    { provide: LOCALE_ID, useValue: 'es-PE' },
    { provide: DEFAULT_CURRENCY_CODE, useValue: 'PEN' },
    { provide: DATE_PIPE_DEFAULT_OPTIONS, useValue: { timezone: '-0500' } }
  ]
}).catch(err => console.error(err));
