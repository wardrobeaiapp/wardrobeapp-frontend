// Re-export all types and functions from calculator and storage
export * from './coverageCalculator';
export * from './coverageStorage';
export * from './frequencyBasedNeedsCalculator';

// Deprecated modules (kept for backward compatibility)
export * from './needsBasedCoverageCalculator';
export * from './outfitRequirements';
export * from './outfitCombinationCalculator';

// Export the main service class
export { ScenarioCoverageService } from './scenarioCoverageService';

// Export the trigger functions
export { 
  triggerItemAddedCoverage, 
  triggerItemUpdatedCoverage, 
  triggerItemDeletedCoverage 
} from './scenarioCoverageTriggerService';
