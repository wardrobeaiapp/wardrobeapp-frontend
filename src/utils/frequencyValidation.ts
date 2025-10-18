/**
 * Utility functions for validating frequency inputs in onboarding
 */

export interface FrequencyLimits {
  min: number;
  max: number;
}

/**
 * Get maximum frequency value based on the selected period
 */
export const getFrequencyLimits = (period: string): FrequencyLimits => {
  switch (period) {
    case 'week':
      return { min: 0, max: 7 }; // Maximum 7 times per week
    case 'month':
      return { min: 0, max: 31 }; // Maximum 31 times per month
    default:
      return { min: 0, max: 31 }; // Default fallback
  }
};

/**
 * Validate and clamp frequency value to the allowed range
 */
export const validateFrequency = (value: number, period: string): number => {
  const { min, max } = getFrequencyLimits(period);
  
  // Ensure the value is within bounds
  if (value < min) return min;
  if (value > max) return max;
  
  return value;
};

/**
 * Get user-friendly period display name
 */
export const getPeriodDisplayName = (period: string): string => {
  switch (period) {
    case 'week':
      return 'week';
    case 'month':
      return 'month';
    default:
      return period;
  }
};
