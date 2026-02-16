import { WritableSignal } from "@angular/core";
import { IDateRange } from "../interfaces/date";

export function getStartOfDayToNowRange(startRange: Date): IDateRange {
    const endDate = new Date();

    const startDate = new Date(startRange);
    startDate.setHours(0, 0, 0, 0);

    return {
        startDate: Math.floor(startDate.getTime() / 1000),
        endDate: Math.floor(endDate.getTime() / 1000)
    };
}

export function formatComparisonPeriodLabel(
    periodDays: number
): string {
    const period = periodDays === 1 ? 'dernier jour' : `${periodDays} derniers jours`;
    return `vs ${period}`;
}

export function getMinutesFromDate(date: Date | undefined): number | null {
    if (!date) return null;
    return date.getHours() * 60 + date.getMinutes();
}

export function validateTimeRange(
    from: Date | undefined,
    to: Date | undefined,
    errorSignal: WritableSignal<string | null>
): void {
    const fromMinutes = getMinutesFromDate(from);
    const toMinutes = getMinutesFromDate(to);

    /* When we pass a signal to a function, we pass the reference to the signal, not its value. 
    so we are able to update the signal value from the function. */
    if (fromMinutes !== null && toMinutes !== null && toMinutes <= fromMinutes) {
        errorSignal.set('L\'horaire de début doit être supérieur à l\'horaire de fin');
    } else {
        errorSignal.set(null);
    }
}

export function isTimeRangeWithin(
    innerFrom: number | null,
    innerTo: number | null,
    outerFrom: number | null,
    outerTo: number | null,
    minSpaceMinutes: number = 2
): {
    fromValid: boolean;
    toValid: boolean;
    hasSpace: boolean;
} {
    if (innerFrom === null || innerTo === null || outerFrom === null || outerTo === null) {
        return { fromValid: true, toValid: true, hasSpace: true };
    }

    return {
        fromValid: innerFrom >= outerFrom,
        toValid: innerTo <= outerTo,
        hasSpace: (outerTo - outerFrom) >= minSpaceMinutes
    };
}