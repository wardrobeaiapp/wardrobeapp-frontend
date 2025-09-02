import { WardrobeItem } from '../../../types';

// Constants
export const TABLE_NAME = 'wardrobe_items';

// Type for database error handling
type SupabaseError = {
  code: string;
  message: string;
  details?: string;
};

/**
 * Converts snake_case object keys to camelCase
 * @param obj Object with snake_case keys
 * @returns Object with camelCase keys
 */
export const snakeToCamelCase = <T extends Record<string, any>>(obj: T): Record<string, any> => {
  if (!obj || typeof obj !== 'object' || obj === null) return obj;
  
  return Object.keys(obj).reduce((result, key) => {
    // Convert key from snake_case to camelCase
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    
    // Handle nested objects and arrays recursively
    let value = obj[key];
    if (value && typeof value === 'object') {
      if (Array.isArray(value)) {
        value = value.map(item => {
          if (item && typeof item === 'object' && !Array.isArray(item)) {
            return snakeToCamelCase(item);
          }
          return item;
        });
      } else {
        value = snakeToCamelCase(value);
      }
    }
    
    return { ...result, [camelKey]: value };
  }, {});
};

/**
 * Converts camelCase object keys to snake_case
 * @param obj Object with camelCase keys
 * @returns Object with snake_case keys
 */
export const camelToSnakeCase = <T extends Record<string, any>>(obj: T): Record<string, any> => {
  if (!obj || typeof obj !== 'object' || obj === null) return obj;
  
  return Object.keys(obj).reduce((result, key) => {
    // Convert key from camelCase to snake_case
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    
    // Handle nested objects and arrays recursively
    let value = obj[key];
    if (value && typeof value === 'object') {
      if (Array.isArray(value)) {
        value = value.map(item => {
          if (item && typeof item === 'object' && !Array.isArray(item)) {
            return camelToSnakeCase(item);
          }
          return item;
        });
      } else {
        value = camelToSnakeCase(value);
      }
    }
    
    return { ...result, [snakeKey]: value };
  }, {});
};

/**
 * Standard error handler for Supabase queries
 * @param error Supabase error object
 * @param operation Description of the operation that failed
 * @param returnNull If true, returns null instead of throwing for specific error codes
 * @returns null if returnNull is true and error code matches criteria
 * @throws Error with formatted message
 */
export const handleSupabaseError = (
  error: SupabaseError | null, 
  operation: string,
  returnNull: boolean = false,
  notFoundCodes: string[] = ['PGRST116']
): null | never => {
  if (!error) return null;
  
  // Handle "not found" errors
  if (returnNull && notFoundCodes.includes(error.code)) {
    return null;
  }
  
  // Log the error
  console.error(`[itemService] Error ${operation}:`, error);
  
  // Throw a formatted error
  throw error;
};

/**
 * Helper to convert database items to WardrobeItem objects
 * @param data Array of database items
 * @returns Array of WardrobeItem objects
 */
export const convertToWardrobeItems = (data: any[]): WardrobeItem[] => {
  if (!data || !Array.isArray(data)) return [];
  return data.map(item => snakeToCamelCase(item) as WardrobeItem);
};

/**
 * Helper to convert a single database item to a WardrobeItem object
 * @param data Single database item
 * @returns WardrobeItem object or null
 */
export const convertToWardrobeItem = (data: any): WardrobeItem | null => {
  if (!data) return null;
  return snakeToCamelCase(data) as WardrobeItem;
};
