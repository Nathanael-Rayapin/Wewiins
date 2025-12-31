import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { KeycloakService } from './services/keycloak.service';

function initializeKeycloak(): () => Promise<boolean> {
  return async () => await inject(KeycloakService).init();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideAppInitializer(initializeKeycloak()),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes)
  ]
};
