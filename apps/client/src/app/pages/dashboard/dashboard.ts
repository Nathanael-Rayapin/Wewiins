import { Component, effect, inject } from '@angular/core';
import { TitleSection } from '../../components/title-section/title-section';
import { OrchestrationService } from '../../services/orchestration.service';
import { KeycloakService } from '../../services/keycloak.service';

@Component({
  selector: 'app-dashboard',
  imports: [TitleSection],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {

  private keycloakService = inject(KeycloakService);
  private orchestrationService = inject(OrchestrationService);

  constructor() {
    effect(() => {
      if (this.keycloakService.isReady()) {
        this.loadDashboardData();
      }
    });
  }

  private loadDashboardData(): void {
    this.orchestrationService.initializeDashboard().subscribe({
      next: (response) => {
        console.log("Liste de revenue : ", response.revenue);
      },
      error: (error) => {
        console.error("Erreur lors du chargement du dashboard", error);
      }
    });
  }
}
