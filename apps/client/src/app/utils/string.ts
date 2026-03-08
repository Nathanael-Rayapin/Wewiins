export function toCapitalize(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

export function isValueExist(value: string | number | null | undefined): boolean {
  if (value === null || value === undefined) {
    return false;
  }

  if (typeof value === 'string') {
    return value.trim() !== '';
  }

  return true;
}