import { Scenario } from '../../../scenarios/types';

/**
 * Lifestyle types that affect wardrobe needs - SIMPLIFIED
 */
export type LifestyleType = 'indoor_focused' | 'outdoor_focused';

/**
 * Lifestyle analysis result with detected type - SIMPLIFIED
 */
export interface LifestyleAnalysis {
  type: LifestyleType;
  confidence: number; // 0-1, how confident we are in the detection
  factors: string[]; // Human-readable factors that influenced the decision
}

/**
 * SEASONAL OUTERWEAR TARGETS: Different needs by season (imported from backend constants)
 */
export const SEASONAL_OUTERWEAR_TARGETS = {
  'summer': { min: 1, ideal: 2, max: 3 },           // Light cardigan, light jacket
  'winter': { min: 2, ideal: 3, max: 4 },           // Heavy coat, warm jacket, maybe backup
  'spring/fall': { min: 3, ideal: 4, max: 5 },      // Need variety: light jacket, medium coat, rain jacket, blazer
  'default': { min: 2, ideal: 3, max: 4 }           // Fallback - more realistic
};

/**
 * REALISTIC TARGETS: Common sense numbers based on actual needs (no weird multipliers)
 */
export const LIFESTYLE_TARGETS = {
  // Outerwear uses seasonal + lifestyle adjustments
  outerwear: {
    // These are base seasonal targets, adjusted by lifestyle below
    seasonal: SEASONAL_OUTERWEAR_TARGETS
  },
  bags: {
    indoor_focused: { min: 3, ideal: 4, max: 5 },    // Same min (basic function), lower ideal/max
    outdoor_focused: { min: 3, ideal: 5, max: 7 }    // Same min, higher ideal/max for variety
  },
  footwear: {
    indoor_focused: { min: 3, ideal: 4, max: 5 },    // Same min (basic function), lower ideal/max  
    outdoor_focused: { min: 3, ideal: 6, max: 8 }    // Same min, higher ideal/max for work/weather/activities
  },
  accessories: {
    // Keep accessories as calculated since they're more varied
    indoor_focused: { multiplier: 0.8 },
    outdoor_focused: { multiplier: 1.0 }
  }
};

/**
 * ULTRA-SIMPLE: Detect lifestyle based on daily activities
 * INDOOR = Remote work OR housekeeping without outdoor activities
 * OUTDOOR = Everyone else (default for safety)
 */
function detectLifestyleFromScenarios(scenarios: Scenario[]): { type: LifestyleType; factors: string[] } {
  const factors: string[] = [];
  
  // Check scenario names for key indicators
  const scenarioNames = scenarios.map(s => s.name?.toLowerCase() || '');
  
  // INDOOR CASE 1: Remote work (work from home)
  const hasRemoteWork = scenarioNames.some(name => name.includes('remote work'));
  if (hasRemoteWork) {
    factors.push('Works from home - minimal outerwear needs');
    return { type: 'indoor_focused', factors };
  }
  
  // INDOOR CASE 2: Housekeeping WITHOUT outdoor activities
  const hasHousekeeping = scenarioNames.some(name => 
    name.includes('housekeeping') || name.includes('staying at home')
  );
  
  const hasOutdoorActivities = scenarioNames.some(name =>
    name.includes('driving') ||           // Driving kids to school/activities
    name.includes('playground') ||        // Playground activities with kids
    name.includes('school') ||           // Attending events at kids' school
    name.includes('outdoor activities') || // Light outdoor activities
    name.includes('social outings')     // Social outings           
  );
  
  if (hasHousekeeping && !hasOutdoorActivities) {
    factors.push('Home-focused lifestyle without outdoor activities - minimal outerwear needs');
    return { type: 'indoor_focused', factors };
  }
  
  // OUTDOOR (Default): Everyone else
  const outdoorReasons = [];
  if (scenarioNames.some(name => name.includes('office work'))) {
    outdoorReasons.push('office commute');
  }
  if (scenarioNames.some(name => name.includes('driving'))) {
    outdoorReasons.push('driving kids around');
  }
  if (scenarioNames.some(name => name.includes('playground'))) {
    outdoorReasons.push('playground activities');
  }
  if (hasOutdoorActivities) {
    outdoorReasons.push('regular outdoor activities');
  }
  
  if (outdoorReasons.length > 0) {
    factors.push(`Outdoor lifestyle: ${outdoorReasons.join(', ')} - needs outerwear variety`);
  } else {
    factors.push('Mixed or unclear activities - defaulting to outdoor lifestyle for safety');
  }
  
  return { type: 'outdoor_focused', factors };
}

/**
 * SIMPLIFIED: Detect lifestyle type based on user scenarios
 */
export function detectLifestyleType(scenarios: Scenario[]): LifestyleAnalysis {
  if (!scenarios || scenarios.length === 0) {
    return {
      type: 'outdoor_focused', // Default to outdoor for safety
      confidence: 0.5,
      factors: ['No scenarios available - defaulting to outdoor lifestyle for safety']
    };
  }
  
  const detection = detectLifestyleFromScenarios(scenarios);
  
  return {
    type: detection.type,
    confidence: 0.9, // High confidence in simple binary detection
    factors: detection.factors
  };
}

/**
 * Get seasonal outerwear targets with lifestyle adjustments
 */
export function getOuterwearTargets(
  season: string,
  lifestyleType: LifestyleType
): { min: number; ideal: number; max: number } {
  // Get base seasonal targets
  const seasonKey = season in SEASONAL_OUTERWEAR_TARGETS ? season : 'default';
  const baseTargets = SEASONAL_OUTERWEAR_TARGETS[seasonKey as keyof typeof SEASONAL_OUTERWEAR_TARGETS];
  
  // Apply lifestyle adjustments
  if (lifestyleType === 'indoor_focused') {
    // Indoor people need fewer pieces (rarely go out)
    return {
      min: Math.max(1, Math.floor(baseTargets.min * 0.7)),  // Reduce by 30%
      ideal: Math.max(1, Math.floor(baseTargets.ideal * 0.7)),
      max: Math.max(2, Math.floor(baseTargets.max * 0.7))
    };
  } else {
    // Outdoor people use the full seasonal targets (they need the variety)
    return baseTargets;
  }
}

/**
 * Get realistic lifestyle targets for bags and footwear
 */
export function getLifestyleTargets(
  category: 'bags' | 'footwear',
  lifestyleType: LifestyleType
): { min: number; ideal: number; max: number } {
  return LIFESTYLE_TARGETS[category][lifestyleType];
}

/**
 * Get lifestyle multiplier for accessories (still calculated)
 */
export function getLifestyleMultiplier(
  category: 'accessories',
  lifestyleType: LifestyleType
): number {
  return LIFESTYLE_TARGETS.accessories[lifestyleType].multiplier;
}

/**
 * SIMPLIFIED: Analyze lifestyle and log results for debugging
 */
export function analyzeAndLogLifestyle(scenarios: Scenario[]): LifestyleAnalysis {
  const analysis = detectLifestyleType(scenarios);
  
  console.log(`🏠🏃 LIFESTYLE ANALYSIS - Type: ${analysis.type} (${Math.round(analysis.confidence * 100)}% confidence)`);
  console.log(`   Key Factors:`, analysis.factors);
  
  // Show seasonal outerwear examples
  const springOuterwear = getOuterwearTargets('spring/fall', analysis.type);
  const bagTargets = getLifestyleTargets('bags', analysis.type);
  console.log(`   Example Targets - Spring/Fall Outerwear: ${springOuterwear.ideal}, Bags: ${bagTargets.ideal}`);
  
  return analysis;
}
