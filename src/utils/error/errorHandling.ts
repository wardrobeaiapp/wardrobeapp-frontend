/**
 * Logs errors with consistent formatting
 * @param context The context or component where the error occurred
 * @param message The error message
 * @param error The actual error object
 */
export const logError = (context: string, message: string, error: unknown): void => {
  console.error(`[${context}] ${message}:`, error);
};

/**
 * Safely executes a function and handles any errors
 * @param fn The async function to execute
 * @param errorHandler Function to handle errors
 * @param context The context to use in error logging
 * @returns Result of the function or undefined if an error occurred
 */
export const safeExecute = async<T>(
  fn: () => Promise<T>,
  errorHandler: (error: unknown) => void,
  context = 'safeExecute'
): Promise<T | undefined> => {
  try {
    return await fn();
  } catch (error) {
    logError(context, 'Error executing function', error);
    errorHandler(error);
    return undefined;
  }
};

/**
 * Validates an image file
 * @param file The file to validate
 * @param maxSize Maximum file size in bytes
 * @returns Object containing validation result and error message if any
 */
export const validateImageFile = (file: File, maxSize = 10 * 1024 * 1024): { isValid: boolean; errorMessage?: string } => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (!validTypes.includes(file.type)) {
    return {
      isValid: false,
      errorMessage: 'Please select a valid image file (JPEG, PNG, or WebP)'
    };
  }
  
  if (file.size > maxSize) {
    return {
      isValid: false,
      errorMessage: `Image size must be less than ${maxSize / (1024 * 1024)}MB`
    };
  }
  
  return { isValid: true };
};
