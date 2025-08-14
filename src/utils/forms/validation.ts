// Shared validation utilities for form components
// These can be reused across different feature forms while maintaining independence

export interface ValidationRule<T = any> {
  validate: (value: T) => boolean;
  message: string;
}

export type ValidationRules<T = Record<string, any>> = {
  [K in keyof T]?: ValidationRule[];
}

export interface ValidationErrors {
  [key: string]: string;
}

/**
 * Generic validation function that can be used across different forms
 */
export const validateField = <T>(value: T, rules: ValidationRule<T>[]): string | null => {
  for (const rule of rules) {
    if (!rule.validate(value)) {
      return rule.message;
    }
  }
  return null;
};

/**
 * Validate multiple fields at once
 */
export const validateFields = <T extends Record<string, any>>(
  data: T,
  rules: Partial<Record<keyof T, ValidationRule[]>>
): ValidationErrors => {
  const errors: ValidationErrors = {};
  
  for (const [field, fieldRules] of Object.entries(rules)) {
    const value = data[field as keyof T];
    const error = validateField(value, fieldRules as ValidationRule[]);
    if (error) {
      errors[field] = error;
    }
  }
  
  return errors;
};

// Common validation rules that can be reused
export const validationRules = {
  required: <T>(message = 'This field is required'): ValidationRule<T> => ({
    validate: (value) => {
      if (typeof value === 'string') return value.trim().length > 0;
      if (Array.isArray(value)) return value.length > 0;
      return value !== null && value !== undefined && value !== '';
    },
    message,
  }),

  minLength: (min: number, message?: string): ValidationRule<string> => ({
    validate: (value) => !value || value.length >= min,
    message: message || `Must be at least ${min} characters`,
  }),

  maxLength: (max: number, message?: string): ValidationRule<string> => ({
    validate: (value) => !value || value.length <= max,
    message: message || `Must be no more than ${max} characters`,
  }),

  email: (message = 'Please enter a valid email address'): ValidationRule<string> => ({
    validate: (value) => {
      if (!value) return true; // Allow empty for optional fields
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    },
    message,
  }),

  numeric: (message = 'Must be a valid number'): ValidationRule<string> => ({
    validate: (value) => {
      if (!value) return true; // Allow empty for optional fields
      return !isNaN(Number(value));
    },
    message,
  }),

  positiveNumber: (message = 'Must be a positive number'): ValidationRule<string> => ({
    validate: (value) => {
      if (!value) return true; // Allow empty for optional fields
      const num = Number(value);
      return !isNaN(num) && num > 0;
    },
    message,
  }),

  minArrayLength: <T>(min: number, message?: string): ValidationRule<T[]> => ({
    validate: (value) => Array.isArray(value) && value.length >= min,
    message: message || `Must select at least ${min} ${min === 1 ? 'item' : 'items'}`,
  }),

  url: (message = 'Please enter a valid URL'): ValidationRule<string> => ({
    validate: (value) => {
      if (!value) return true; // Allow empty for optional fields
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    },
    message,
  }),

  custom: <T>(validator: (value: T) => boolean, message: string): ValidationRule<T> => ({
    validate: validator,
    message,
  }),
};

/**
 * Helper function to check if form has any errors
 */
export const hasValidationErrors = (errors: ValidationErrors): boolean => {
  return Object.keys(errors).length > 0;
};

/**
 * Helper function to get the first error message
 */
export const getFirstError = (errors: ValidationErrors): string | null => {
  const firstKey = Object.keys(errors)[0];
  return firstKey ? errors[firstKey] : null;
};

/**
 * Helper function to clear specific field errors
 */
export const clearFieldError = (
  errors: ValidationErrors,
  field: string
): ValidationErrors => {
  const newErrors = { ...errors };
  delete newErrors[field];
  return newErrors;
};

/**
 * Helper function to set field error
 */
export const setFieldError = (
  errors: ValidationErrors,
  field: string,
  message: string
): ValidationErrors => {
  return {
    ...errors,
    [field]: message,
  };
};
