import { Component, inject, signal } from '@angular/core';
import { Button } from '../button/button';
import { KeycloakService } from '../../services/keycloak.service';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-title-section',
  imports: [Button, NgOptimizedImage],
  templateUrl: './title-section.html',
  styleUrl: './title-section.css',
})
export class TitleSection {
  protected readonly keycloakService = inject(KeycloakService);

  isHovered = signal(false);
}
