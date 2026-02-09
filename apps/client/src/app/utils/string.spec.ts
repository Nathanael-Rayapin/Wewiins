import { describe, it, expect } from 'vitest';
import { toCapitalize } from './string';

describe('toCapitalize', () => {
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
