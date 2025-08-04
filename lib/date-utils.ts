export function calculateAge(birthDate: string | Date): string {
  const birth = new Date(birthDate);
  const today = new Date();
  
  let years = today.getFullYear() - birth.getFullYear();
  let months = today.getMonth() - birth.getMonth();
  
  if (months < 0) {
    years--;
    months += 12;
  }
  
  if (today.getDate() < birth.getDate()) {
    months--;
    if (months < 0) {
      years--;
      months += 12;
    }
  }
  
  if (years === 0) {
    return months === 1 ? "1 month" : `${months} months`;
  } else if (months === 0) {
    return years === 1 ? "1 year" : `${years} years`;
  } else {
    const yearText = years === 1 ? "1 year" : `${years} years`;
    const monthText = months === 1 ? "1 month" : `${months} months`;
    return `${yearText}, ${monthText}`;
  }
}

/**
 * Calculate age in months (for programmatic use)
 */
export function calculateAgeInMonths(birthDate: string | Date): number {
  const birth = new Date(birthDate);
  const today = new Date();
  
  let years = today.getFullYear() - birth.getFullYear();
  let months = today.getMonth() - birth.getMonth();
  
  if (months < 0) {
    years--;
    months += 12;
  }
  
  if (today.getDate() < birth.getDate()) {
    months--;
    if (months < 0) {
      years--;
      months += 12;
    }
  }
  
  return years * 12 + months;
}

/**
 * Format a date for display
 */
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const dateObj = new Date(date);
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  
  return dateObj.toLocaleDateString("en-US", options || defaultOptions);
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
