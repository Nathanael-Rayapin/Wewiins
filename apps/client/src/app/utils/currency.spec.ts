import { formatPrice } from "./currency";

describe('Format Price', () => {
  it.concurrent('should return a string if price is less than 1000', () => {
    const result = formatPrice(29.99);

    expect(typeof result).toBe("string");
    expect(result).toBe("29.99");
  });

  it.concurrent('should return a string with K if price is greater than 1000', () => {
    const result = formatPrice(1200);

    expect(typeof result).toBe("string");
    expect(result).toBe("1.2K");
  });
});
