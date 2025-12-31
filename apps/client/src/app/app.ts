import { Component, inject, signal } from '@angular/core';

import { KeycloakService } from './services/keycloak.service';

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('client');

  public keycloakService = inject(KeycloakService);
}
