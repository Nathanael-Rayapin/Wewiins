import { IDateFrom, IDateRange } from "../interfaces/date";

export function getDateRange(period: IDateFrom): IDateRange {
    // Yesterday at 23:59:59 p.m.
    const endDate = new Date();
    endDate.setDate(endDate.getDate() - 1);
    endDate.setHours(23, 59, 59, 999);

    const startDate = new Date(endDate);
    startDate.setHours(0, 0, 0, 0);

    // Calculation based on endDate and period
    switch (period) {
        case "aWeekAgo":
            startDate.setDate(startDate.getDate() - 7);
            break;
        case "aMonthAgo":
            startDate.setMonth(startDate.getMonth() - 1);
            break;
        case "aYearAgo":
            startDate.setFullYear(startDate.getFullYear() - 1);
            break;
        default:
            startDate.setDate(startDate.getDate() - 7);
    }
    
    return { 
        startDate: Math.floor(startDate.getTime() / 1000), 
        endDate: Math.floor(endDate.getTime() / 1000)
    };
}