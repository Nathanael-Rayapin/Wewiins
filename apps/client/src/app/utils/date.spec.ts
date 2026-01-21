import { getDateRange } from "./date";

describe('Date', () => {
  it.concurrent('should take a valid period parameter', () => {
    // Parameter typing makes it impossible to add an incorrect value.
    const rangeAWeekAgo = getDateRange("aWeekAgo");

    expect(rangeAWeekAgo).toBeTruthy();
    expect(rangeAWeekAgo.startDate).toBeDefined();
    expect(rangeAWeekAgo.endDate).toBeDefined();
  });

  it.concurrent('should return values of types number', () => {
    const range = getDateRange("aWeekAgo");

    expect(typeof range.startDate).toBe("number");
    expect(typeof range.endDate).toBe("number");
  });

  it.concurrent('should return a range of 7 days for type aWeekAgo', () => {
    const range = getDateRange("aWeekAgo");
    const startDate = new Date(range.startDate * 1000);
    const endDate = new Date(range.endDate * 1000);

    expect(endDate.getDate() - startDate.getDate()).toBe(7);
  });

  it.concurrent('should return a range of 1 month for type aMonthAgo', () => {
    const range = getDateRange("aMonthAgo");
    const startDate = new Date(range.startDate * 1000);
    const endDate = new Date(range.endDate * 1000);

    // getMonth = [0, 1, 2, ..., 11]
    const previousMonth = (endDate.getMonth() + (12 - 1)) % 12;
    expect(startDate.getMonth()).toBe(previousMonth);
  });

  it.concurrent('should return a range of 1 year for type aYearAgo', () => {
    const range = getDateRange("aYearAgo");
    
    const startDate = new Date(range.startDate * 1000);
    const endDate = new Date(range.endDate * 1000);
    
    expect(endDate.getFullYear() - startDate.getFullYear()).toBe(1);
  });
});
