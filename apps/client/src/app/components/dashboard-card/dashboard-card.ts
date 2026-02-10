import { Component, computed, effect, input, signal } from '@angular/core';
import { IStatComparison } from '../../dto/dashboard';
import { DashboardStatKey } from '../../pages/dashboard/data/dashboard.data';
import { NgOptimizedImage } from '@angular/common';
import { formatComparisonPeriodLabel } from '../../utils/date';

@Component({
  selector: 'app-dashboard-card',
  imports: [NgOptimizedImage],
  templateUrl: './dashboard-card.html',
  styleUrl: './dashboard-card.css',
})
export class DashboardCard {
  label = input.required<string>();
  stat = input.required<IStatComparison<number>>();
  iconPath = input.required<string>();
  key = input.required<DashboardStatKey>();

  filterRangeDays = input.required<number>();
  filterRangeDaysStr = signal<string>('');

  constructor() {
    effect(() => {
      if (this.stat() && this.filterRangeDays()) {
        this.filterRangeDaysStr.set(formatComparisonPeriodLabel(this.filterRangeDays()));
      }
    })
  }

  protected displayValue = computed(() => {
    const value = this.stat().currentValue;

    switch (this.key()) {
      case 'totalRevenue':
        return `${value.toLocaleString('fr-FR', { maximumFractionDigits: 2 })}`;
      case 'averageScore':
        return `${value}/5`;
      default:
        return value.toString();
    }
  });
}
