import { ApplicationConfig, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import Keycloak from 'keycloak-js';

export let keycloak: Keycloak;

function initializeKeycloak(): () => Promise<boolean> {
  return () => {
    keycloak = new Keycloak({
      url: 'http://localhost:8080',
      realm: 'wewiins',
      clientId: 'saas'
    });

    return keycloak.init({
      onLoad: 'login-required',
    });
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideAppInitializer(initializeKeycloak()),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes)
  ]
};
