// Test file to verify imports from caseConversion.ts
import { camelToSnakeCase, snakeToCamelCase } from './caseConversion';

// Simple test function
export const testCaseConversion = () => {
  const snakeObj = { user_id: 1, first_name: 'John' };
  const camelObj = snakeToCamelCase(snakeObj);
  console.log('Converted to camel case:', camelObj);
  
  const backToSnake = camelToSnakeCase(camelObj);
  console.log('Converted back to snake case:', backToSnake);
};
