import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { GLOBAL_TTL_TOKEN } from '@ravimallya/ng-lazy-cache';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    { provide: GLOBAL_TTL_TOKEN, useValue: 30000 } // Global TTL of 30 seconds
  ]
};