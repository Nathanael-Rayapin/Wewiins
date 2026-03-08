import { Component, OnInit, signal, ViewEncapsulation } from '@angular/core';
import { TitleSection } from '../../components/title-section/title-section';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { IconSvg } from '../../components/icon-svg/icon-svg';
import { DividerModule } from 'primeng/divider';
import { TooltipModule } from 'primeng/tooltip';
import { RatingModule } from 'primeng/rating';
import { ChartModule } from 'primeng/chart';
import { IStatisticKPIs, IVoteDistribution } from './statistic.interface';
import { Trend } from '../../components/trend/trend';
import { kpis, votes } from './data/statistic.data';
import { FormsModule } from '@angular/forms';
import { ProgressBarModule } from 'primeng/progressbar';

@Component({
  selector: 'app-statistic',
  imports: [
    TitleSection,
    IconSvg,
    Trend,
    ProgressSpinnerModule,
    FormsModule,
    DividerModule,
    TooltipModule,
    ChartModule,
    RatingModule,
    ProgressBarModule,
    RatingModule
  ],
  templateUrl: './statistic.html',
  styleUrl: './statistic.css',
  encapsulation: ViewEncapsulation.None,
})
export class Statistic implements OnInit {
  private readonly MONTH_THRESHOLD = 21;
  private readonly DAY_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  private readonly MONTH_LABELS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

  isLoading = signal(false);
  startDate = signal<Date>(this.getDefaultStartDate());

  kpis: IStatisticKPIs[] = kpis;
  votes: IVoteDistribution[] = votes;

  data: any;
  options: any;

  starsValue: number = 4.7;

  ngOnInit(): void {
    this.initChart();
  }

  initChart(): void {
    const labels = this.getLabels();
    const rawData = this.getMockedData(labels.length);

    this.data = {
      labels,
      datasets: [{
        label: '',
        backgroundColor: this.getColors(rawData),
        data: rawData,
        barPercentage: this.getBarPercentage(),
        categoryPercentage: 0.6,
        borderRadius: 6,
      }]
    };

    this.options = {
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: {
          ticks: {
            stepSize: 50
          }
        }
      },
    };
  }

  get totalVotes(): number {
    return this.votes.reduce((sum, v) => sum + v.count, 0);
  }

  protected getPercentage(count: number): number {
    if (this.totalVotes === 0) return 0;
    return (count / this.totalVotes) * 100;
  }

  private get filterRangeDays(): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const start = new Date(this.startDate());
    start.setHours(0, 0, 0, 0);

    const diffMs = today.getTime() - start.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    return Math.max(1, diffDays);
  }

  private get isMonthView(): boolean {
    return this.filterRangeDays > this.MONTH_THRESHOLD;
  }

  private getDefaultStartDate(): Date {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date;
  }

  private getLabels(): string[] {
    if (this.isMonthView) {
      const monthCount = Math.min(Math.ceil(this.filterRangeDays / 30), 12);
      return this.MONTH_LABELS.slice(0, monthCount);
    }
    return Array.from({ length: this.filterRangeDays }, (_, i) => this.DAY_LABELS[i % 7]);
  }

  private getBarPercentage(): number {
    if (this.isMonthView) return 0.5;
    if (this.filterRangeDays <= 7) return 0.5;
    if (this.filterRangeDays <= 14) return 0.3;
    return 0.15;
  }

  private getColors(data: number[]): string[] {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min;
    const tier1 = min + range / 3;
    const tier2 = min + (range * 2) / 3;

    return data.map(value => {
      if (value < tier1) return '#c60541';
      if (value < tier2) return '#ffce34';
      return '#49a3a3';
    });
  }

  private getMockedData(length: number): number[] {
    return Array.from({ length }, () => Math.floor(Math.random() * 150) + 50);
  }

}
