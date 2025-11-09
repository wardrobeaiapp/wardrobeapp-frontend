import { Scenario } from '../../../scenarios/types';
import { analyzeAndLogLifestyle, LifestyleAnalysis } from '../lifestyle/lifestyleDetectionService';

// Performance optimization: Cache lifestyle analysis to avoid redundant calculations
let lifestyleCache: { scenarioKey: string; result: LifestyleAnalysis } | null = null;

/**
 * Get cached lifestyle analysis to avoid redundant calculations during bulk updates
 */
export function getCachedLifestyleAnalysis(scenarios: Scenario[]): LifestyleAnalysis {
  // Create a cache key based on scenario names and frequencies
  const scenarioKey = scenarios
    .map(s => `${s.name}:${s.frequency}`)
    .sort()
    .join('|');
  
  // Return cached result if scenarios haven't changed
  if (lifestyleCache && lifestyleCache.scenarioKey === scenarioKey) {
    console.log(`🏠🏃 LIFESTYLE CACHE HIT - Using cached ${lifestyleCache.result.type} analysis`);
    return lifestyleCache.result;
  }
  
  // Calculate new lifestyle analysis and cache it
  const result = analyzeAndLogLifestyle(scenarios);
  lifestyleCache = { scenarioKey, result };
  console.log(`🏠🏃 LIFESTYLE CACHE MISS - Calculated and cached ${result.type} analysis`);
  
  return result;
}
