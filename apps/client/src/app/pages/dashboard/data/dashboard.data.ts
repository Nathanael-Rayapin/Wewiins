import { signal } from "@angular/core";
import { IDashboardDto, IStatComparison } from "../../../dto/dashboard";

// We don't want an object but a key, with Exclude on keyof IDashboardStatsComparison instead of Omit.
export type DashboardStatKey = Exclude<keyof IDashboardDto, ['filterRangeDays','bookings','isCompleted']>;

interface IDashboardStatsData {
    label: string;
    value: IStatComparison<number>;
    iconPath: string;
    key: DashboardStatKey;
}

export const defaultStats: IStatComparison<number> = {
  currentValue: 0,
  previousValue: 0,
  percentageChange: 0,
  trend: 'STABLE',
};

export const dashboardStatsData = signal<IDashboardStatsData[]>([
    {
        label: "Chiffre d'affaires",
        value: { ...defaultStats },
        iconPath: "../../../assets/icons/euro.svg",
        key: "totalRevenue"
    },
    {
        label: "Nombre de réservations",
        value:{ ...defaultStats },
        iconPath: "../../../assets/icons/ticket.svg",
        key: "totalBooking"
    },
    {
        label: "Nombre de visiteurs",
        value: { ...defaultStats },
        iconPath: "../../../assets/icons/user.svg",
        key: "totalVisit"
    },
    {
        label: "Note moyenne",
        value: { ...defaultStats },
        iconPath: "../../../assets/icons/star.svg",
        key: "averageScore"
    }
]);

