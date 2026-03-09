export type Trend = 'UP' | 'DOWN' | 'STABLE';

export interface IStatComparisonDto<T> {
    currentValue: T;
    previousValue: T;
    percentageChange: number;
    trend: Trend;
}