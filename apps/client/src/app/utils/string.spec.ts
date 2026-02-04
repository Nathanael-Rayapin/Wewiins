import { describe, it, expect } from 'vitest';
import { toCapitalize, getRangeAndFormat } from './string';
import { IStatComparison } from '../dto/dashboard';

describe('String', () => {

    describe.concurrent('toCapitalize', () => {

        it.concurrent('should capitalize first letter of a lowercase word', () => {
            expect(toCapitalize('dashboard')).toBe('Dashboard');
        });

        it.concurrent('should keep first letter uppercase if already capitalized', () => {
            expect(toCapitalize('Dashboard')).toBe('Dashboard');
        });

        it.concurrent('should handle a single character', () => {
            expect(toCapitalize('a')).toBe('A');
        });

        it.concurrent('should return empty string when input is empty', () => {
            expect(toCapitalize('')).toBe('');
        });

        it.concurrent('should not modify the rest of the string', () => {
            expect(toCapitalize('dASHBOARD')).toBe('DASHBOARD');
        });
    });

    describe.concurrent('getRangeAndFormat', () => {

        const baseStat: IStatComparison<number> = {
            currentValue: 10,
            previousValue: 8,
            percentageChange: 25,
            trend: 'STABLE',
        };

        it.concurrent('should return "dernier jour" when periodDays is 1', () => {
            const result = getRangeAndFormat(baseStat, 1);
            expect(result).toBe(' vs dernier jour');
        });

        it.concurrent('should return pluralized period when periodDays > 1', () => {
            const result = getRangeAndFormat(baseStat, 7);
            expect(result).toBe(' vs 7 derniers jours');
        });

        it.concurrent('should return same format when trend is UP', () => {
            const stat: IStatComparison<number> = {
                ...baseStat,
                trend: 'UP',
            };

            const result = getRangeAndFormat(stat, 3);
            expect(result).toBe(' vs 3 derniers jours');
        });

        it.concurrent('should return same format when trend is DOWN', () => {
            const stat: IStatComparison<number> = {
                ...baseStat,
                trend: 'DOWN',
            };

            const result = getRangeAndFormat(stat, 5);
            expect(result).toBe(' vs 5 derniers jours');
        });
    });
});
