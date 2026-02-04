import { getDateRange } from "./date";

describe('Date', () => {
  it.concurrent('should return startDate and endDate', () => {
    const result = getDateRange(new Date());

    expect(result).toBeTruthy();
    expect(result.startDate).toBeDefined();
    expect(result.endDate).toBeDefined();
  });

  it.concurrent('should return values of types number', () => {
    const result = getDateRange(new Date());

    expect(typeof result.startDate).toBe("number");
    expect(typeof result.endDate).toBe("number");
  });
});
