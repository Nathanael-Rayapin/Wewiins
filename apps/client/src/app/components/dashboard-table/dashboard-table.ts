import { ChangeDetectionStrategy, Component, computed, input, ViewEncapsulation } from '@angular/core';
import { TableModule } from 'primeng/table';
import { IDashboardBooking, IDashboardColumn } from './dashboard-table.interface';
import { dashboardColums } from './data/dashboard-table.data';
import { CapitalizePipe } from "../../pipes/capitalize.pipe";
import { CurrencyPipe, DatePipe } from '@angular/common';
import { StatusButton } from '../status-button/status-button';
import { BookingStatusPipe } from '../../pipes/status.pipe';
import { DatePickerModule } from 'primeng/datepicker';
import { DurationPipe } from '../../pipes/duration.pipe';

@Component({
  selector: 'app-dashboard-table',
  imports: [TableModule, DatePickerModule, StatusButton, CapitalizePipe, DatePipe, CurrencyPipe, BookingStatusPipe, DurationPipe],
  templateUrl: './dashboard-table.html',
  styleUrl: './dashboard-table.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardTable {
  columns: IDashboardColumn[] = dashboardColums;
  bookings = input.required<IDashboardBooking[]>();

  protected bookingsComputed = computed(() => {
    const data = this.bookings();
    return data.slice().sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  });
}
