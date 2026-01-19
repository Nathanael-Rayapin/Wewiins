// For API processing 
export type IDateFrom = "aWeekAgo" | "aMonthAgo" | "aYearAgo";

// For UI display
export const dateRangeOptions: Record<IDateFrom, string> = {
  aWeekAgo: 'Semaine',
  aMonthAgo: 'Mois',
  aYearAgo: 'Année'
};

export interface IDateRange {
  startDate: number;
  endDate: number;
}