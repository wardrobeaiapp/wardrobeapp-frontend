// Re-export types and functions from active modules
export * from './frequencyBasedNeedsCalculator';
export * from './categoryBasedCoverageService';

// Export the trigger functions
export { 
  triggerItemAddedCoverage, 
  triggerItemUpdatedCoverage, 
  triggerItemDeletedCoverage 
} from './scenarioCoverageTriggerService';
