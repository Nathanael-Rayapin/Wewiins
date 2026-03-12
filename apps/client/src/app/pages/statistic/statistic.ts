import { Component, inject, OnInit, signal, ViewEncapsulation, WritableSignal } from '@angular/core';
import { TitleSection } from '../../components/title-section/title-section';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { IconSvg } from '../../components/icon-svg/icon-svg';
import { DividerModule } from 'primeng/divider';
import { TooltipModule } from 'primeng/tooltip';
import { RatingModule } from 'primeng/rating';
import { ChartModule } from 'primeng/chart';
import { IChartData, IChartOptions, IStatisticKPIs } from './statistic.interface';
import { Trend } from '../../components/trend/trend';
import { DAY_LABELS, defaultStatisticData, kpis, MONTH_LABELS, MONTH_THRESHOLD } from './data/statistic.data';
import { FormsModule } from '@angular/forms';
import { ProgressBarModule } from 'primeng/progressbar';
import { StatisticService } from '../../services/statistic.service';
import { IStatisticDto, IVisitDataPointDto } from '../../dto/statistic';
import { Datepicker } from '../../components/datepicker/datepicker';

@Component({
  selector: 'app-statistic',
  imports: [
    TitleSection,
    IconSvg,
    Trend,
    Datepicker,
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
  private statisticService = inject(StatisticService);

  isLoading = signal(false);
  startDate = signal<Date>(this.getDefaultStartDate());

  kpis: IStatisticKPIs[] = kpis;

  data: IChartData | null = null;
  options: IChartOptions | null = null;

  statisticData: WritableSignal<IStatisticDto> = defaultStatisticData;
  filterRangeDays = signal<number>(0);

  starsValue: number = 0;

  get totalRevenue(): string {
    return this.statisticData().totalRevenue.currentValue
      .toLocaleString('fr-FR', { maximumFractionDigits: 2 });
  }

  get totalNetRevenue(): string {
    return (this.statisticData().totalRevenue.currentValue - this.statisticData().totalCharges.currentValue)
      .toLocaleString('fr-FR', { maximumFractionDigits: 2 });
  }

  get totalCharge(): string {
    return this.statisticData().totalCharges.currentValue
      .toLocaleString('fr-FR', { maximumFractionDigits: 2 });
  }

  get totalBooking(): string {
    return this.statisticData().totalBooking.currentValue
      .toLocaleString('fr-FR', { maximumFractionDigits: 2 });
  }

  get averageScore(): string {
    return `${this.statisticData().averageScore.currentValue
      .toLocaleString('fr-FR', { maximumFractionDigits: 2 })}/5`;
  }

  get totalVotes(): number {
    return this.statisticData().scoreDistribution.reduce((sum, v) => sum + v.count, 0);
  }

  ngOnInit(): void {
    this.initStatistic();
  }

  protected initStatistic(): void {
    this.isLoading.set(true);

    this.statisticService.initializeStatistic(this.startDate()).subscribe({
      next: (response) => {
        this.statisticData.set(response);
        this.starsValue = response.averageScore.currentValue;
        this.filterRangeDays.set(response.filterRangeDays);

        this.updateKPIs();
        this.initChart(response.visitsByPeriod);
      },
      error: (error: Error) => {
        console.error("Erreur lors du chargement de la page de statistiques", error.name);
        this.isLoading.set(false);
      },
      complete: () => {
        this.isLoading.set(false);
      }
    });
  }

  private updateKPIs(): void {
    this.kpis.forEach(kpi => {
      const value = this.statisticData()[kpi.name].currentValue;
      kpi.value = value;
    });
  }

  initChart(visitsByPeriod: IVisitDataPointDto[]): void {
    const labels = this.getLabels();

    const chartData = this.isMonthView
      ? this.aggregateByMonth(visitsByPeriod, labels)
      : this.aggregateByDay(visitsByPeriod, labels);

    this.data = {
      labels,
      datasets: [{
        label: '',
        backgroundColor: this.getColors(chartData),
        data: chartData,
        barPercentage: this.getBarPercentage(),
        categoryPercentage: 0.6,
        borderRadius: 6,
      }]
    };

    this.options = {
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { ticks: { stepSize: 50 } }
      },
    };
  }

  protected getPercentage(count: number): number {
    if (this.totalVotes === 0) return 0;
    return (count / this.totalVotes) * 100;
  }

  private aggregateByDay(visits: IVisitDataPointDto[], labels: string[]): number[] {
    const counts = new Array(labels.length).fill(0);

    visits.forEach(point => {
      const date = new Date(point.date * 1000);
      const dayIndex = (date.getDay() + 6) % 7;

      if (dayIndex < counts.length) {
        counts[dayIndex] += point.count;
      }
    });

    return counts;
  }

  private aggregateByMonth(visits: IVisitDataPointDto[], labels: string[]): number[] {
    const counts = new Array(labels.length).fill(0);

    visits.forEach(point => {
      const date = new Date(point.date * 1000);
      const monthIndex = date.getMonth();

      if (monthIndex < counts.length) {
        counts[monthIndex] += point.count;
      }
    });

    return counts;
  }

  private get isMonthView(): boolean {
    return this.filterRangeDays() > MONTH_THRESHOLD;
  }

  private getDefaultStartDate(): Date {
    const date = new Date();
    date.setDate(date.getDate() - 6);
    return date;
  }

  private getLabels(): string[] {
    if (this.isMonthView) {
      const monthCount = Math.min(Math.ceil(this.filterRangeDays() / 30), 12);
      return MONTH_LABELS.slice(0, monthCount);
    }
    return Array.from({ length: this.filterRangeDays() }, (_, i) => DAY_LABELS[i % 7]);
  }

  private getBarPercentage(): number {
    if (this.isMonthView) return 0.5;
    if (this.filterRangeDays() <= 7) return 0.5;
    if (this.filterRangeDays() <= 14) return 0.3;
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

}
