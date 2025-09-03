/**
 * Calendar utility functions
 */

import type { LocalDayPlan } from '../hooks/calendar';

/**
 * Formats a date to YYYY-MM-DD format in local timezone
 * This prevents timezone issues when converting dates
 */
export const formatDateToYYYYMMDD = (date: Date): string => {
  // Use local timezone date parts instead of UTC
  const year = date.getFullYear();
  // Month is 0-indexed in JS Date, so add 1 and pad with leading zero if needed
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Normalizes a date from either Date object or string to YYYY-MM-DD format
 */
export const normalizeDateToYYYYMMDD = (date: Date | string): string => {
  if (date instanceof Date) {
    return formatDateToYYYYMMDD(date);
  } else if (typeof date === 'string') {
    // Handle ISO string or other string formats
    return date.split('T')[0];
  }
  return '';
};

/**
 * Checks if two dates are the same day (ignoring time)
 */
export const isSameDay = (date1: Date | string, date2: Date | string): boolean => {
  const normalizedDate1 = normalizeDateToYYYYMMDD(date1);
  const normalizedDate2 = normalizeDateToYYYYMMDD(date2);
  return normalizedDate1 === normalizedDate2;
};

/**
 * Finds a day plan for a specific date
 */
export const findDayPlanForDate = (dayPlans: LocalDayPlan[], date: Date): LocalDayPlan | undefined => {
  const dateFormatted = formatDateToYYYYMMDD(date);
  
  return dayPlans.find(plan => {
    const planDateStr = normalizeDateToYYYYMMDD(plan.date);
    return planDateStr === dateFormatted;
  });
};

/**
 * Checks if a day has a plan
 */
export const hasDayPlan = (dayPlans: LocalDayPlan[], date: Date): boolean => {
  return dayPlans.some(plan => isSameDay(plan.date, date));
};
