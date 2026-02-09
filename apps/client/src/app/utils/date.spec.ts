import { IStatComparison } from "../dto/dashboard";
import { getDateRange, getRangeAndFormat } from "./date";

describe.concurrent('Get Date Range', () => {
  it('should return startDate and endDate', () => {
    const result = getDateRange(new Date());

    expect(result).toBeTruthy();
    expect(result.startDate).toBeDefined();
    expect(result.endDate).toBeDefined();
  });

  it('should return values of types number', () => {
    const result = getDateRange(new Date());

    expect(typeof result.startDate).toBe("number");
    expect(typeof result.endDate).toBe("number");
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
