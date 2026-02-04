import { signal } from "@angular/core";
import { IDashboardStatsComparison, IStatComparison } from "../../../dto/dashboard";

// We don't want an object but a key, with Exclude on keyof IDashboardStatsComparison instead of Omit.
export type DashboardStatKey = Exclude<keyof IDashboardStatsComparison, 'periodDays'>;

interface IDashboardData {
    label: string;
    value: string | number | undefined;
    iconPath: string;
    key: DashboardStatKey;
}

export const dashboardData = signal<IDashboardData[]>([
    {
        label: "Chiffre d'affaires",
        value: undefined,
        iconPath: "../../../assets/icons/euro.svg",
        key: "revenue"
    },
    {
        label: "Nombre de réservations",
        value: undefined,
        iconPath: "../../../assets/icons/ticket.svg",
        key: "bookingNumber"
    },
    {
        label: "Nombre de visiteurs",
        value: undefined,
        iconPath: "../../../assets/icons/user.svg",
        key: "visitNumber"
    },
    {
        label: "Note moyenne",
        value: undefined,
        iconPath: "../../../assets/icons/star.svg",
        key: "averageScore"
    }
]);

const emptyDashboardStats: IStatComparison<number> = {
  currentValue: 0,
  previousValue: 0,
  percentageChange: 0,
  trend: 'STABLE',
};

export const emptyDashboardStatsComparison: IDashboardStatsComparison = {
  revenue: { ...emptyDashboardStats },
  bookingNumber: { ...emptyDashboardStats },
  visitNumber: { ...emptyDashboardStats },
  averageScore: { ...emptyDashboardStats },
  periodDays: 0,
};