export function formatPrice(price: number): string {
  if (price >= 1000) {
    const inK = price / 1000;
    return `${Math.round(inK * 10) / 10}K`;
  }
  
  return price.toString();
}