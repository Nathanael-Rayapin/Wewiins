import { WritableSignal } from "@angular/core";
import { IDateRange } from "../interfaces/date";
import { IDaySchedule, MOMENT_BOUNDS, MomentCode } from "../pages/activity/steps/step-4/step-4.interface";
import { IScheduledActivity } from "../pages/activity/steps/step-2/step-2.interface";
import { dayOfWeekFullName, availabilityDays, DAY_ORDER } from "../pages/activity/steps/step-2/data/step-2.data";

/**
 * Creates a date range from the start of the day (12:00 AM)
 * of a given date to the current time.
 * 
 * @param startRange Date used as a reference to determine the start of the day 
 * @returns Object containing:
 * startDate: Unix timestamp (in seconds) of the start of the day
 * endDate: Unix timestamp (in seconds) corresponding to now
 */
export function getStartOfDayToNowRange(startRange: Date): IDateRange {
    const endDate = new Date();

    const startDate = new Date(startRange);
    startDate.setHours(0, 0, 0, 0);

    return {
        startDate: Math.floor(startDate.getTime() / 1000),
        endDate: Math.floor(endDate.getTime() / 1000)
    };
}

/**
 * Generates a text label to compare a period in number of days.
 * 
 * @param periodDays Number of days in the comparison period.
 * @returns Formatted text (e.g., “vs. last day,” “vs. last 7 days”).
 */
export function formatComparisonPeriodLabel(
    periodDays: number
): string {
    const period = periodDays === 1 ? 'dernier jour' : `${periodDays} derniers jours`;
    return `vs ${period}`;
}

/**
 * Converts a Date to the total number of minutes elapsed since midnight.
 * 
 * @param date Date | undefined → Date to convert.
 * @returns number | null → Number of minutes since 00:00.
 * null if the date is undefined.
 */
export function getMinutesFromDate(date: Date | undefined): number | null {
    if (!date) return null;
    return date.getUTCHours() * 60 + date.getUTCMinutes();
}

/**
 * Checks that a time slot is valid
 * (the end time must be strictly greater than the start time).
 * Updates the error signal accordingly.
 * 
 * @param from Date | undefined → Start time.
 * @param to Date | undefined → End time.
 * @param errorSignal WritableSignal<string | null> → Angular signal that allows
 * you to store an error message or null.
 */
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

/**
 * Check whether an internal time slot is included in an external time slot
 * and whether it complies with a minimum space requirement.
 * 
 * @param innerFrom number | null → Start of the internal slot (in minutes).
 * @param innerTo number | null → End of internal slot (in minutes).
 * @param outerFrom number | null → Start of the external slot (in minutes).
 * @param outerTo number | null → End of external slot (in minutes).
 * @param minSpaceMinutes number → Minimum duration required for the external slot (default: 2).
 * @returns { fromValid: boolean; toValid: boolean; hasSpace: boolean }
 */
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

/**
 * Deducts the times of day (TimeCode) covered
 * by a given time slot.
 * 
 * @param fromMinutes number → Start of the time slot (in minutes since midnight).
 * @param toMinutes End of slot (in minutes since midnight).
 * @returns List of times of day covered by the slot.
 */
function deduceMomentsFromRange(fromMinutes: number, toMinutes: number): MomentCode[] {
    return (Object.entries(MOMENT_BOUNDS) as [MomentCode, { from: number; to: number }][])
        .filter(([, bounds]) => fromMinutes < bounds.to && toMinutes > bounds.from)
        .map(([code]) => code);
}

/**
 * Builds the structure of days with their available times
 * from a list of planned activities.
 * 
 * @param scheduledActivities List of activities with selected days and times.
 * @returns Table containing for each day:
 * day: dayOfWeekFullName
 * availableMoments: MomentCode[] (always including ‘ALL’ first)
 */
export function buildDaySchedules(scheduledActivities: IScheduledActivity[]): IDaySchedule[] {
    const dayMomentsMap = new Map<dayOfWeekFullName, Set<MomentCode>>();

    for (const activity of scheduledActivities) {
        if (!activity.openTime || !activity.closeTime) continue;

        const fromDate = new Date(activity.openTime);
        const toDate = new Date(activity.closeTime);

        const fromMinutes = getMinutesFromDate(fromDate);
        const toMinutes = getMinutesFromDate(toDate);

        if (fromMinutes === null || toMinutes === null) continue;

        const moments = deduceMomentsFromRange(fromMinutes, toMinutes);

        for (const day of activity.dayOfWeek) {
            if (!dayMomentsMap.has(day)) {
                dayMomentsMap.set(day, new Set<MomentCode>());
            }
            moments.forEach(m => dayMomentsMap.get(day)!.add(m));
        }
    }

    return availabilityDays
        .map(day => day.fullname)
        .filter(day => dayMomentsMap.has(day))
        .map(day => ({
            day,
            availableMoments: [
                'ALL',
                ...(Object.keys(MOMENT_BOUNDS) as MomentCode[]).filter(
                    m => dayMomentsMap.get(day)!.has(m)
                )
            ] as MomentCode[]
        }));
}

/**
 * Converts a Date object into a time string formatted as HH:mm:ss (UTC).
 *
 * @param date The Date object to format.
 * @returns A string representing the time in UTC format (HH:mm:ss).
 */
export function toTimeString(date: Date): string {
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    const seconds = date.getUTCSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}

/**
 * Converts a Date object into the total number of minutes
 * elapsed since midnight (based on the local time).
 *
 * @param date The Date object to extract the time from.
 * @returns The number of minutes since 00:00.
 */
export function getMinutes(date: Date): number {
    return date.getHours() * 60 + date.getMinutes();
}