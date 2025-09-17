// Main entry point for duplicate detection service

export { DuplicateDetectionService } from './duplicateDetectionService';
export { ExtractionService } from './extractionService';

export type {
  ItemData,
  ExistingItem,
  DuplicateDetectionResult,
  DuplicateAnalysis,
  VarietyImpact,
  RecommendationResult,
  ExtractedAttributes
} from './types';

export {
  COLOR_FAMILIES,
  SILHOUETTE_FAMILIES,
  SIMILARITY_WEIGHTS,
  DUPLICATE_THRESHOLDS
} from './constants';

// Convenience function for quick analysis
import { DuplicateDetectionService } from './duplicateDetectionService';
import type { ItemData, ExistingItem, DuplicateDetectionResult } from './types';

const duplicateService = new DuplicateDetectionService();

export function analyzeDuplicates(
  itemData: ItemData, 
  existingItems: ExistingItem[]
): DuplicateDetectionResult {
  return duplicateService.analyze(itemData, existingItems);
}
