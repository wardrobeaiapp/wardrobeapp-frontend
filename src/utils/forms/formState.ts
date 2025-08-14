// Shared form state management patterns
// These utilities provide consistent state management across feature forms

import { useState, useCallback } from 'react';
import { ValidationErrors, validateFields, ValidationRules } from './validation';

export interface FormState<T> {
  data: T;
  errors: ValidationErrors;
  isSubmitting: boolean;
  isDirty: boolean;
}

export interface FormActions<T> {
  updateField: (field: keyof T, value: T[keyof T]) => void;
  updateFields: (updates: Partial<T>) => void;
  setError: (field: string, message: string) => void;
  clearError: (field: string) => void;
  clearAllErrors: () => void;
  setSubmitting: (isSubmitting: boolean) => void;
  validateForm: () => boolean;
  resetForm: () => void;
  setFormData: (data: Partial<T>) => void;
}

export interface UseFormStateOptions<T> {
  initialData: T;
  validationRules?: ValidationRules<T>;
  onSubmit?: (data: T) => void | Promise<void>;
}

/**
 * Generic form state hook that can be used across different feature forms
 */
export const useFormState = <T extends Record<string, any>>({
  initialData,
  validationRules = {},
  onSubmit,
}: UseFormStateOptions<T>): [FormState<T>, FormActions<T>] => {
  const [data, setData] = useState<T>(initialData);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const updateField = useCallback((field: keyof T, value: T[keyof T]) => {
    setData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
    
    // Clear error for this field when user starts typing
    if (errors[field as string]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field as string];
        return newErrors;
      });
    }
  }, [errors]);

  const updateFields = useCallback((updates: Partial<T>) => {
    setData(prev => ({ ...prev, ...updates }));
    setIsDirty(true);
  }, []);

  const setError = useCallback((field: string, message: string) => {
    setErrors(prev => ({ ...prev, [field]: message }));
  }, []);

  const clearError = useCallback((field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  const setSubmitting = useCallback((submitting: boolean) => {
    setIsSubmitting(submitting);
  }, []);

  const validateForm = useCallback((): boolean => {
    const validationErrors = validateFields(data, validationRules);
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  }, [data, validationRules]);

  const resetForm = useCallback(() => {
    setData(initialData);
    setErrors({});
    setIsSubmitting(false);
    setIsDirty(false);
  }, [initialData]);

  const setFormData = useCallback((newData: Partial<T>) => {
    setData(prev => ({ ...prev, ...newData }));
  }, []);

  const state: FormState<T> = {
    data,
    errors,
    isSubmitting,
    isDirty,
  };

  const actions: FormActions<T> = {
    updateField,
    updateFields,
    setError,
    clearError,
    clearAllErrors,
    setSubmitting,
    validateForm,
    resetForm,
    setFormData,
  };

  return [state, actions];
};

/**
 * Generic form submission handler
 */
export const useFormSubmission = <T>(
  onSubmit: (data: T) => void | Promise<void>
) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(async (
    data: T,
    validateFn: () => boolean,
    onError?: (error: Error) => void
  ) => {
    if (isSubmitting) return;

    if (!validateFn()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Form submission error:', error);
      if (onError) {
        onError(error instanceof Error ? error : new Error('Submission failed'));
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, onSubmit]);

  return {
    isSubmitting,
    handleSubmit,
  };
};

/**
 * Hook for managing array fields in forms (like tags, seasons, etc.)
 */
export const useArrayField = <T>(
  initialValue: T[] = [],
  onChange?: (values: T[]) => void
) => {
  const [values, setValues] = useState<T[]>(initialValue);

  const addValue = useCallback((value: T) => {
    const newValues = [...values, value];
    setValues(newValues);
    onChange?.(newValues);
  }, [values, onChange]);

  const removeValue = useCallback((value: T) => {
    const newValues = values.filter(v => v !== value);
    setValues(newValues);
    onChange?.(newValues);
  }, [values, onChange]);

  const toggleValue = useCallback((value: T) => {
    const exists = values.includes(value);
    const newValues = exists 
      ? values.filter(v => v !== value)
      : [...values, value];
    setValues(newValues);
    onChange?.(newValues);
  }, [values, onChange]);

  const hasValue = useCallback((value: T) => {
    return values.includes(value);
  }, [values]);

  const clearValues = useCallback(() => {
    setValues([]);
    onChange?.([]);
  }, [onChange]);

  return {
    values,
    setValues,
    addValue,
    removeValue,
    toggleValue,
    hasValue,
    clearValues,
  };
};

/**
 * Hook for managing file uploads in forms
 */
export const useFileUpload = (
  onFileSelect?: (file: File) => void,
  onError?: (error: string) => void
) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = useCallback((file: File) => {
    // Basic file validation
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (file.size > maxSize) {
      onError?.('File size must be less than 10MB');
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      onError?.('Please select a JPEG, PNG, or WebP image');
      return;
    }

    setSelectedFile(file);
    onFileSelect?.(file);
  }, [onFileSelect, onError]);

  const clearFile = useCallback(() => {
    setSelectedFile(null);
  }, []);

  return {
    selectedFile,
    isUploading,
    setIsUploading,
    handleFileSelect,
    clearFile,
  };
};
