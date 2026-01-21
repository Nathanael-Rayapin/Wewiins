import { Component, effect, inject, signal, WritableSignal } from '@angular/core';
import { TitleSection } from '../../components/title-section/title-section';
import { FormsModule } from '@angular/forms';
import { OrchestrationService } from '../../services/orchestration.service';
import { KeycloakService } from '../../services/keycloak.service';
import { SelectModule } from 'primeng/select';
import { dateRangeOptions, IDateFrom } from '../../interfaces/date';
import { BaseChartDirective } from 'ng2-charts';
import { chartRevenueData, chartRevenueOptions } from './data/chart.data';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { IActivityRevenue } from '../../dto/activity';
import { formatPrice } from '../../utils/price';
import { ActivityService } from '../../services/activity.service';

@Component({
  selector: 'app-dashboard',
  imports: [TitleSection, FormsModule, SelectModule, BaseChartDirective, ProgressSpinnerModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {

  private keycloakService = inject(KeycloakService);
  private orchestrationService = inject(OrchestrationService);
  private activityService = inject(ActivityService);

  // Chart Base on Revenue
  protected dateRangeSelectOptions = Object.entries(dateRangeOptions)
    .map(([key, value]) => ({
      label: value,
      value: key as IDateFrom
    }));

  protected selectedRange = signal(this.dateRangeSelectOptions[0].value);
  protected chartRevenue = chartRevenueData;
  protected chartOptions = chartRevenueOptions;
  protected revenues: WritableSignal<IActivityRevenue[]> = signal([]);

  isLoading = signal(true);
  hasError = signal(false);
  hasErrorOnRevenue = signal(false);

  constructor() {
    effect(() => {
      if (this.keycloakService.isReady()) {   
        this.initDashboardData();
      }
    });
  }

  private initDashboardData(): void {    
    this.orchestrationService.initializeDashboard().subscribe({
      next: (response) => {       
        this.initRevenues(response.revenue);
      },
      error: (error: Error) => {
        console.error("Erreur lors du chargement du dashboard", error.name);
        this.hasError.set(true);
      },
      complete: () => {
        this.isLoading.set(false);
      }
    });
  }

  private initRevenues(revenues: IActivityRevenue[]): void {
    const newData = revenues.length === 0
      ? [100]
      : revenues.map(r => r.total_price);

    this.chartRevenue.set({
      ...this.chartRevenue(),
      datasets: [{ ...this.chartRevenue().datasets[0], data: newData }]
    });

    this.revenues.set(revenues);
  }

  protected getTotalRevenue(): string {
    const total = this.revenues().reduce((sum, revenue) => sum + revenue.total_price, 0);
    const rounded = Math.round(total);
    return formatPrice(rounded);
  }

  protected updateSelectedRevenueRange(): void {
    this.activityService.loadDashboardRevenue(this.selectedRange()).subscribe({
      next: (response) => {
        this.initRevenues(response);
      },
      error: (error) => {
        console.error("Erreur lors du chargement des revenus", error);
        this.hasErrorOnRevenue.set(true);
      },
      complete: () => {
        this.isLoading.set(false);
      }
    });
  }
}
