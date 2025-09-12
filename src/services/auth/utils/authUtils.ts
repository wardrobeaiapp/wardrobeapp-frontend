// Helper function to convert camelCase to snake_case for database compatibility
export const camelToSnakeCase = (obj: any): any => {
  const snakeCaseObj: any = {};
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      // Convert camelCase to snake_case
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      snakeCaseObj[snakeKey] = obj[key];
    }
  }
  
  return snakeCaseObj;
};

// Debug flag to control console logging
export const DEBUG_MODE = false;

// Helper function for conditional logging
export const debugLog = (message: string, data?: any) => {
  if (DEBUG_MODE) {
    if (data) {
      console.log(message, data);
    } else {
      console.log(message);
    }
  }
};
