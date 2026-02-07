import { Component, computed, input } from '@angular/core';
import { IDashboardBooking } from '../dashboard-table/dashboard-table.interface';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { CapitalizePipe } from '../../pipes/capitalize.pipe';
import { StatusButton } from '../status-button/status-button';
import { BookingStatusPipe } from '../../pipes/status.pipe';

@Component({
  selector: 'app-dashboard-table-card',
  imports: [DatePipe, CapitalizePipe, BookingStatusPipe, CurrencyPipe, StatusButton],
  templateUrl: './dashboard-table-card.html',
  styleUrl: './dashboard-table-card.css',
})
export class DashboardTableCard {
  bookings = input.required<IDashboardBooking[]>();

  protected bookingsComputed = computed(() => {
    const data = this.bookings().length > 2 
    ? this.bookings().slice(0, 2) 
    : this.bookings();

    return data.slice().sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  });
}
