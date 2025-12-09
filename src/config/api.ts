/**
 * API Configuration for different environments
 */

// Get the current environment
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

// API Base URL Configuration
export const API_BASE_URL = (() => {
  // Development: use proxy to backend server
  if (isDevelopment) {
    return '';  // Empty string uses proxy defined in package.json
  }
  
  // Production: API calls are handled by serverless functions
  if (isProduction) {
    return '';  // Same origin (netlify functions are served at same domain)
  }
  
  // Fallback
  return '';
})();

/**
 * Get full API URL for a given endpoint
 */
export const getApiUrl = (endpoint: string): string => {
  // Ensure endpoint starts with /
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  // Return full URL
  return `${API_BASE_URL}${normalizedEndpoint}`;
};

/**
 * API Endpoints
 */
export const API_ENDPOINTS = {
  WAITLIST: '/api/waitlist',
  WAITLIST_STATS: '/api/waitlist/stats',
  AUTH: '/api/auth',
  WARDROBE_ITEMS: '/api/wardrobe-items',
  OUTFITS: '/api/outfits',
  CAPSULES: '/api/capsules',
  ANALYZE_SIMPLE: '/api/analyze-wardrobe-item-simple',
  AI_ANALYSIS_MOCKS: '/api/ai-analysis-mocks'
} as const;
