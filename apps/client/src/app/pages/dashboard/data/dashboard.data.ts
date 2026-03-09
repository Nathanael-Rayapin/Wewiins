import { signal } from "@angular/core";
import { IDashboardDto } from "../../../dto/dashboard";
import { IStatComparisonDto } from "../../../dto/common";

// We don't want an object but a key, with Exclude on keyof IDashboardStatsComparison instead of Omit.
export type DashboardStatKey = Exclude<keyof IDashboardDto, ['filterRangeDays','bookings','isCompleted']>;

interface IDashboardStatsData {
    label: string;
    value: IStatComparisonDto<number>;
    iconName: string;
    key: DashboardStatKey;
}

export const defaultStats: IStatComparisonDto<number> = {
  currentValue: 0,
  previousValue: 0,
  percentageChange: 0,
  trend: 'STABLE',
};

export const dashboardStatsData = signal<IDashboardStatsData[]>([
    {
        label: "Chiffre d'affaires",
        value: { ...defaultStats },
        iconName: "euro",
        key: "totalRevenue"
    },
    {
        label: "Nombre de réservations",
        value:{ ...defaultStats },
        iconName: "ticket",
        key: "totalBooking"
    },
    {
        label: "Nombre de visiteurs",
        value: { ...defaultStats },
        iconName: "user",
        key: "totalVisit"
    },
    {
        label: "Note moyenne",
        value: { ...defaultStats },
        iconName: "star",
        key: "averageScore"
    }
]);

