// Re-export types and functions from active modules
export * from './frequencyBasedNeedsCalculator';
export * from './category';

// Export the trigger functions
export { 
  triggerItemAddedCoverage, 
  triggerItemUpdatedCoverage, 
  triggerItemDeletedCoverage 
} from './scenarioCoverageTriggerService';
