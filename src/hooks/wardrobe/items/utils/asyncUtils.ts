/**
 * Async utility functions for wardrobe items management
 */

/**
 * Utility function to yield control back to the main thread
 * Helps prevent UI blocking during heavy operations
 */
export const yieldToMain = (): Promise<void> => {
  return new Promise(resolve => {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => resolve(undefined), { timeout: 50 });
    } else {
      setTimeout(() => resolve(undefined), 0);
    }
  });
};

/**
 * Async function to parse localStorage without blocking the main thread
 * @param key - localStorage key to parse
 * @returns Parsed array or empty array if key doesn't exist
 */
export const parseLocalStorageAsync = async (key: string): Promise<any[]> => {
  return new Promise(resolve => {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        const data = localStorage.getItem(key);
        resolve(data ? JSON.parse(data) : []);
      }, { timeout: 100 });
    } else {
      setTimeout(() => {
        const data = localStorage.getItem(key);
        resolve(data ? JSON.parse(data) : []);
      }, 0);
    }
  });
};
