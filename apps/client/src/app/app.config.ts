import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { KeycloakService } from './services/keycloak.service';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './interceptors/auth.interceptor';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { providePrimeNG } from 'primeng/config';
import Aura  from '@primeuix/themes/aura';

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
    ), 
    provideCharts(withDefaultRegisterables()),
    providePrimeNG({
            theme: {
                preset: Aura 
            }
        })
  ]
};
