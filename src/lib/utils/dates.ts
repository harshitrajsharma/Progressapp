/**
 * Convert API date strings to Date objects
 */
export function toDate(date: string | Date | null): Date | null {
  if (!date) return null;
  return date instanceof Date ? date : new Date(date);
}

/**
 * Convert Date objects to ISO strings for API
 */
export function toISOString(date: Date | string | null): string | null {
  if (!date) return null;
  return date instanceof Date ? date.toISOString() : date;
}

/**
 * Convert an object's date fields from strings to Date objects
 */
export function convertDates<T extends Record<string, unknown>>(
  obj: T,
  dateFields: (keyof T)[]
): T {
  const result = { ...obj };
  for (const field of dateFields) {
    if (field in result) {
      const value = result[field];
      result[field] = toDate(value as string | Date | null) as T[keyof T];
    }
  }
  return result;
} 