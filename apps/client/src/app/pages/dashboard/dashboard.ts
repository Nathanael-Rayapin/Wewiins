import { Component, effect, inject, signal, WritableSignal } from '@angular/core';
import { TitleSection } from '../../components/title-section/title-section';
import { FormsModule } from '@angular/forms';
import { OrchestrationService } from '../../services/orchestration.service';
import { KeycloakService } from '../../services/keycloak.service';
import { SelectModule } from 'primeng/select';
import { dateRangeOptions } from '../../interfaces/date';
import { BaseChartDirective } from 'ng2-charts';
import { chartRevenueData, chartRevenueOptions } from './data/chart.data';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { IActivityRevenue } from '../../dto/activity';
import { formatPrice } from '../../utils/price';

@Component({
  selector: 'app-dashboard',
  imports: [TitleSection, FormsModule, SelectModule, BaseChartDirective, ProgressSpinnerModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {

  private keycloakService = inject(KeycloakService);
  private orchestrationService = inject(OrchestrationService);

  // Chart Base on Revenue
  protected dateRange: string[] = Object.values(dateRangeOptions);
  protected selectedRange = signal(this.dateRange[0]);
  protected chartRevenue = chartRevenueData;
  protected chartOptions = chartRevenueOptions;
  protected revenues: WritableSignal<IActivityRevenue[]> = signal([]);

  isLoading = signal(true);
  hasError = signal(false);

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
        this.initRevenues(response.revenue);
      },
      error: (error) => {
        console.error("Erreur lors du chargement du dashboard", error);
        this.hasError.set(true);
      },
      complete: () => {
        this.isLoading.set(false);
      }
    });
  }

  protected initRevenues(revenues: IActivityRevenue[]): void {
    if (revenues.length === 0) {
      // If no revenues, we set a default value
      this.chartRevenue.update((revenue) => {
        revenue.datasets[0].data = [100];
        return revenue;
      });
    } else {
      // Else, we update the chart with the new revenues
      this.chartRevenue.update((revenue) => {
        revenue.datasets[0].data = revenues.map(revenue => revenue.total_price);
        return revenue;
      });

      this.revenues.set(revenues);
    }
  }

  protected getTotalRevenue(): string {
    const total = this.revenues().reduce((sum, revenue) => sum + revenue.total_price, 0);
    const rounded = Math.round(total);
    return formatPrice(rounded);
  }
}
