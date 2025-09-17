// Constants for duplicate detection algorithms
import { COLOR_FAMILIES, SILHOUETTE_FAMILIES } from '../../../constants/wardrobeOptions';

// Re-export from shared constants
export { COLOR_FAMILIES, SILHOUETTE_FAMILIES };

// Weights for similarity calculation
export const SIMILARITY_WEIGHTS = {
  CATEGORY: 0, // Must match - 0 score if different
  SUBCATEGORY: 0, // Must match - 0 score if different  
  COLOR: 40, // Most critical for duplication
  SILHOUETTE: 30, // Second most critical
  STYLE: 20, // Secondary factor
  MATERIAL: 10 // Minor factor
} as const;

// Thresholds for duplicate detection
export const DUPLICATE_THRESHOLDS = {
  CRITICAL_DUPLICATE: 85, // Score >= 85 = critical duplicate
  SIMILAR_ITEM: 70, // Score >= 70 = similar item
  VARIETY_RISK_THRESHOLD: 60 // % of category in same color/silhouette = risk
} as const;

// Severity levels based on duplicate count
export const DUPLICATE_SEVERITY = {
  NONE: { min: 0, max: 0 },
  MODERATE: { min: 1, max: 1 },
  HIGH: { min: 2, max: 2 },
  EXCESSIVE: { min: 3, max: Infinity }
} as const;
