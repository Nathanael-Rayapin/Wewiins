import { Component, effect, inject, signal, WritableSignal } from '@angular/core';
import { TitleSection } from '../../components/title-section/title-section';
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { OrchestrationService } from '../../services/orchestration.service';
import { KeycloakService } from '../../services/keycloak.service';
import { SelectModule } from 'primeng/select';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DashboardCard } from '../../components/dashboard-card/dashboard-card';
import { dashboardStatsData } from './data/dashboard.data';
import { DashboardTable } from '../../components/dashboard-table/dashboard-table';
import { IDashboardBooking } from '../../components/dashboard-table/dashboard-table.interface';
import { Datepicker } from '../../components/datepicker/datepicker';
import { DashboardTableCard } from '../../components/dashboard-table-card/dashboard-table-card';
import { IDashboardDto } from '../../dto/dashboard';

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
  warningMessage = signal('');

  dashboardStatsData = dashboardStatsData;
  dashboardTableData: WritableSignal<IDashboardBooking[]> = signal([]);

  startDate = signal<Date>(new Date());
  filterRangeDays = signal<number>(0);

  constructor() {
    effect(() => {
      if (this.keycloakService.isReady()) {
        this.initDashboard();
      }
    });
  }

  protected initDashboard(): void {
    this.orchestrationService.initializeDashboard(this.startDate()).subscribe({
      next: (response) => {
        this.initDashboardStats(response);
        this.initDashboardTable(response.bookings);
        this.initWarningMessage(response.isRevenueCompletelyLoad);
        
        this.filterRangeDays.set(response.filterRangeDays);
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

  private initDashboardStats(response: IDashboardDto): void {
    this.dashboardStatsData.update((data) => {
      return data.map(item => {
        switch (item.key) {
          case 'totalRevenue':
            return { ...item, value: response.totalRevenue };
          case 'totalBooking':
            return { ...item, value: response.totalBooking };
          case 'totalVisit':
            return { ...item, value: response.totalVisit };
          case 'averageScore':
            return { ...item, value: response.averageScore };
          default:
            return item;
        }
      });
    });
  }

  private initDashboardTable(bookings: IDashboardBooking[]): void {
    this.dashboardTableData.set(bookings);
  }

  // TODO: Display warning message somewhere when revenue is not completely loaded
  private initWarningMessage(isRevenueCompletelyLoad: boolean): void {
    if (isRevenueCompletelyLoad) {
      this.warningMessage.set('Les données de chiffre d\'affaires sont complètement chargées');
    } else {
      this.warningMessage.set('Les données de chiffre d\'affaires ne sont pas complètement chargées');
    }
  }
}
