import { IDashboardBooking } from "../components/dashboard-table/dashboard-table.interface";
import { IStatComparisonDto } from "./common";

export interface IDashboardDto {
    totalRevenue: IStatComparisonDto<number>;
    totalBooking: IStatComparisonDto<number>;
    totalVisit: IStatComparisonDto<number>;
    averageScore: IStatComparisonDto<number>;
    filterRangeDays: number;
    bookings: IDashboardBooking[];
    isRevenueCompletelyLoad: boolean;
}