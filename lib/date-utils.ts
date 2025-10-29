/**
 * Get current UTC date as YYYY-MM-DD string
 */
export function getCurrentUTCDateString(): string {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).toISOString().split('T')[0];
}

/**
 * Convert any date to UTC date string (YYYY-MM-DD)
 */
export function toUTCDateString(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())).toISOString().split('T')[0];
}

/**
 * Get start of day in UTC for a given date
 */
export function getUTCStartOfDay(date: Date | string): Date {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
}

/**
 * Get end of day in UTC for a given date
 */
export function getUTCEndOfDay(date: Date | string): Date {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 23, 59, 59, 999));
}

export function calculateExactAge(birthDate: Date): { years: number; months: number } {
  const today = new Date();
  const todayUTC = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  const birthUTC = new Date(Date.UTC(birthDate.getUTCFullYear(), birthDate.getUTCMonth(), birthDate.getUTCDate()));
  
  let years = todayUTC.getUTCFullYear() - birthUTC.getUTCFullYear();
  let months = todayUTC.getUTCMonth() - birthUTC.getUTCMonth();

  if (todayUTC.getUTCDate() < birthUTC.getUTCDate()) {
    months--;
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  return { years, months };
}

/**
 * Calculate age in months (for programmatic use)
 */
// Calculate age in months from birth date using UTC
export function calculateAge(birthDate: Date): number {
  const today = new Date();
  const todayUTC = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  const birthUTC = new Date(Date.UTC(birthDate.getUTCFullYear(), birthDate.getUTCMonth(), birthDate.getUTCDate()));
  
  let years = todayUTC.getUTCFullYear() - birthUTC.getUTCFullYear();
  let months = todayUTC.getUTCMonth() - birthUTC.getUTCMonth();

  if (months < 0) {
    years--;
    months += 12;
  }

  return years * 12 + months;
}

/**
 * Format a date for display
 */
// Format date for display (converts to UTC first for consistency)
export function formatDisplayDate(
  date: Date | string,
  options?: Intl.DateTimeFormatOptions
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  // Convert to UTC for consistent display
  const utcDate = new Date(Date.UTC(
    dateObj.getUTCFullYear(),
    dateObj.getUTCMonth(),
    dateObj.getUTCDate()
  ));
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC"
  };
  return utcDate.toLocaleDateString("en-US", options || defaultOptions);
}

/**
 * Simple date formatter for display purposes
 */
export function formatDate(date: Date | string): string {
  return formatDisplayDate(date);
}

/**
 * Calculate days remaining until a future date
 */
export function calculateDaysRemaining(futureDate: string | Date): number {
  const future = new Date(futureDate);
  const today = new Date();
  
  const timeDiff = future.getTime() - today.getTime();
  return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
}
