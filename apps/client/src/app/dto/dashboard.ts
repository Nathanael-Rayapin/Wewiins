import { IDashboardBooking } from "../components/dashboard-table/dashboard-table.interface";

export type Trend = 'UP' | 'DOWN' | 'STABLE';

export interface IStatComparison<T> {
    currentValue: T;
    previousValue: T;
    percentageChange: number;
    trend: Trend;
}

export interface IDashboardDto {
    totalRevenue: IStatComparison<number>;
    totalBooking: IStatComparison<number>;
    totalVisit: IStatComparison<number>;
    averageScore: IStatComparison<number>;
    filterRangeDays: number;
    bookings: IDashboardBooking[];
    isRevenueCompletelyLoad: boolean;
}