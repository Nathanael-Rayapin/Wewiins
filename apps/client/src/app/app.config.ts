import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { KeycloakService } from './services/keycloak.service';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './interceptors/auth.interceptor';

function initializeKeycloak(): () => Promise<boolean> {
  return async () => await inject(KeycloakService).init();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideAppInitializer(initializeKeycloak()),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor])
    )
  ]
};
