import { Component, effect, input, signal } from '@angular/core';
import { IStatComparison } from '../../dto/dashboard';
import { formatComparisonPeriodLabel } from '../../utils/date';
import { IconSvg } from '../icon-svg/icon-svg';

@Component({
  selector: 'app-trend',
  imports: [IconSvg],
  templateUrl: './trend.html',
  styleUrl: './trend.css',
})
export class Trend {
  stat = input.required<IStatComparison<number>>();
  filterRangeDays = input.required<number>();
  filterRangeDaysStr = signal<string>('');

  constructor() {
    effect(() => {
      if (this.stat() && this.filterRangeDays()) {
        this.filterRangeDaysStr.set(formatComparisonPeriodLabel(this.filterRangeDays()));
      }
    })
  }
}
