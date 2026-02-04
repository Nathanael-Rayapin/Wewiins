export type Trend = 'UP' | 'DOWN' | 'STABLE';

export interface IStatComparison<T> {
  currentValue: T;
  previousValue: T;
  percentageChange: number;
  trend: Trend;
}

export interface IDashboardStatsComparison {
  revenue: IStatComparison<number>;
  bookingNumber: IStatComparison<number>;
  visitNumber: IStatComparison<number>;
  averageScore: IStatComparison<number>;
  periodDays: number;
}