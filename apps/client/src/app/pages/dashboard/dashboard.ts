import { Component, effect, inject, signal, WritableSignal } from '@angular/core';
import { TitleSection } from '../../components/title-section/title-section';
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { OrchestrationService } from '../../services/orchestration.service';
import { KeycloakService } from '../../services/keycloak.service';
import { SelectModule } from 'primeng/select';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { IDashboard } from '../../dto/orchestrator';
import { DashboardCard } from '../../components/dashboard-card/dashboard-card';
import { dashboardData, emptyDashboardStatsComparison } from './data/dashboard.data';
import { DashboardTable } from '../../components/dashboard-table/dashboard-table';
import { IDashboardBooking } from '../../components/dashboard-table/dashboard-table.interface';
import { Datepicker } from '../../components/datepicker/datepicker';
import { DashboardTableCard } from '../../components/dashboard-table-card/dashboard-table-card';
import { IDashboardStatsComparison } from '../../dto/dashboard';

@Component({
  selector: 'app-dashboard',
  imports: [
    TitleSection,
    FormsModule,
    DatePickerModule,
    SelectModule,
    ProgressSpinnerModule,
    DashboardCard,
    DashboardTable,
    DashboardTableCard,
    Datepicker
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {

  private keycloakService = inject(KeycloakService);
  private orchestrationService = inject(OrchestrationService);

  isLoading = signal(true);
  hasError = signal(false);

  dashboardData = dashboardData;
  dashboardTableData: WritableSignal<IDashboardBooking[]> = signal([]);

  stats = signal<IDashboardStatsComparison>(emptyDashboardStatsComparison);
  startDate = signal<Date>(new Date());

  constructor() {
    effect(() => {
      if (this.keycloakService.isReady()) {
        this.initDashboard();
        this.initDashboardStats();
      }
    });
  }

  private initDashboard(): void {
    this.orchestrationService.initializeDashboard().subscribe({
      next: (response) => {
        this.initDashboardData(response);
        this.initBookings(response.bookings);
      },
      error: (error: Error) => {
        this.hasError.set(true);
        console.error("Erreur lors du chargement du dashboard", error.name);
        this.isLoading.set(false);
      },
      complete: () => {
        this.isLoading.set(false);
      }
    });
  }

  protected initDashboardStats(): void {
    this.orchestrationService.initializeDashboardStats(this.startDate()).subscribe({
      next: (response) => {
        this.stats.set(response);
      },
      error: (error) => {
        this.hasError.set(true);
        console.error("Erreur lors du chargement des stats comparatives", error);
      }
    });
  }

  private initDashboardData(response: IDashboard): void {
    this.dashboardData.update((data) => {
      return data.map(item => {
        switch (item.key) {
          case 'revenue':
            return { ...item, value: response.revenue.revenue.toLocaleString('fr-FR', { maximumFractionDigits: 2 }) };
          case 'bookingNumber':
            return { ...item, value: response.bookingNumber };
          case 'visitNumber':
            return { ...item, value: response.visitNumber };
          case 'averageScore':
            return { ...item, value: `${response.averageScore.toString()}/5` };
          default:
            return item;
        }
      });
    });
  }

  private initBookings(bookings: IDashboardBooking[]): void {
    this.dashboardTableData.set(bookings);
  }
}
