import { DurationPipe } from './duration.pipe';

describe('DurationPipe', () => {
    const pipe = new DurationPipe();

    it.concurrent('returns minutes when duration is less than 1 hour', () => {
        const start = new Date('2024-01-01T10:00:00');
        const end = new Date('2024-01-01T10:45:00');

        expect(pipe.transform(start, end)).toBe('45min');
    });

    it.concurrent('returns hours when duration is exactly in hours', () => {
        const start = new Date('2024-01-01T08:00:00');
        const end = new Date('2024-01-01T10:00:00');

        expect(pipe.transform(start, end)).toBe('2h');
    });

    it.concurrent('returns hours and minutes when duration is mixed', () => {
        const start = new Date('2024-01-01T09:15:00');
        const end = new Date('2024-01-01T11:45:00');

        expect(pipe.transform(start, end)).toBe('2h30');
    });

    it.concurrent('handles crossing midnight correctly', () => {
        const start = new Date('2024-01-01T23:30:00');
        const end = new Date('2024-01-02T01:00:00');

        expect(pipe.transform(start, end)).toBe('1h30');
    });

    it.concurrent('returns 0min when start and end are the same', () => {
        const date = new Date('2024-01-01T12:00:00');

        expect(pipe.transform(date, date)).toBe('0min');
    });

    it.concurrent('accepts date strings as input', () => {
        const start = '2024-01-01T14:00:00' as unknown as Date;
        const end = '2024-01-01T15:20:00' as unknown as Date;

        expect(pipe.transform(start, end)).toBe('1h20');
    });
});
