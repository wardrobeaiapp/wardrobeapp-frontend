// DEPRECATED: This file is replaced by frequencyBasedNeedsCalculator.ts
// The frequency-based system is more flexible and works with any user scenario

import { WardrobeItem, Scenario, Season } from '../../../types';
import { OutfitAnalysis } from './outfitCombinationCalculator';

export type NeedsBasedScenarioCoverage = {
  scenarioId: string;
  scenarioName: string;
  season: Season;
  targetOutfits: number;
  currentOutfits: number;
  coverage: number; // percentage of target met
  gapCount: number; // how many outfits short
  bottleneckCategory?: string; // what's limiting the most
  missingCategories: string[];
  recommendations: string[];
  outfitAnalysis: OutfitAnalysis;
  lastUpdated: string;
};

/**
 * @deprecated Use calculateFrequencyBasedNeeds from frequencyBasedNeedsCalculator instead
 * This function is kept for backward compatibility but should not be used in new code
 */
export const calculateNeedsBasedScenarioCoverage = async (
  userId: string,
  items: WardrobeItem[],
  scenarios: Scenario[],
  season: Season,
  customTargets?: Record<string, number>
): Promise<NeedsBasedScenarioCoverage[]> => {
  console.warn('⚠️ DEPRECATED - calculateNeedsBasedScenarioCoverage is deprecated. Use calculateFrequencyBasedNeeds instead.');
  
  // Return empty array for now - this should be replaced with frequency-based calls
  return [];
};

/**
 * Generate actionable recommendations based on outfit analysis
 */
function generateCoverageRecommendations(
  analysis: OutfitAnalysis,
  gapCount: number
): string[] {
  const recommendations: string[] = [];

  if (gapCount === 0) {
    recommendations.push(`✅ You have enough outfits for ${analysis.scenarioName}!`);
    return recommendations;
  }

  // Priority recommendations based on gaps
  if (analysis.missingCategories.length > 0) {
    recommendations.push(
      `🚨 Priority: Add items in ${analysis.missingCategories.join(', ')} to create any ${analysis.scenarioName} outfits`
    );
  }

  if (analysis.bottleneckCategory && gapCount > 0) {
    const currentCount = analysis.possibleOutfits;
    const needed = Math.min(gapCount, 3); // Don't recommend buying too many at once
    
    recommendations.push(
      `📈 Add ${needed} more ${analysis.bottleneckCategory} to increase from ${currentCount} to ${currentCount + needed} ${analysis.scenarioName} outfits`
    );
  }

  // Specific recommendations from outfit analysis
  analysis.recommendations.forEach(rec => {
    if (!recommendations.some(existing => existing.includes(rec))) {
      recommendations.push(`💡 ${rec}`);
    }
  });

  // Shopping priority guidance
  if (gapCount > 5) {
    recommendations.push(`🛍️ Consider a shopping session focused on ${analysis.scenarioName} essentials`);
  } else if (gapCount > 0) {
    recommendations.push(`🎯 ${gapCount} more outfits needed to reach your ${analysis.scenarioName} target`);
  }

  return recommendations.slice(0, 5); // Limit to top 5 recommendations
}

/**
 * Get coverage summary across all scenarios
 */
export const getCoverageSummary = (coverageResults: NeedsBasedScenarioCoverage[]) => {
  const totalTargets = coverageResults.reduce((sum, result) => sum + result.targetOutfits, 0);
  const totalCurrent = coverageResults.reduce((sum, result) => sum + result.currentOutfits, 0);
  const totalGaps = coverageResults.reduce((sum, result) => sum + result.gapCount, 0);
  
  const overallCoverage = totalTargets > 0 ? Math.round((totalCurrent / totalTargets) * 100) : 0;
  
  const wellCoveredScenarios = coverageResults.filter(result => result.coverage >= 80);
  const poorlyCoveredScenarios = coverageResults.filter(result => result.coverage < 50);
  
  return {
    overallCoverage,
    totalTargets,
    totalCurrent,
    totalGaps,
    wellCoveredCount: wellCoveredScenarios.length,
    poorlyCoveredCount: poorlyCoveredScenarios.length,
    wellCoveredScenarios: wellCoveredScenarios.map(s => s.scenarioName),
    poorlyCoveredScenarios: poorlyCoveredScenarios.map(s => s.scenarioName),
    topRecommendations: poorlyCoveredScenarios
      .slice(0, 3)
      .flatMap(s => s.recommendations.slice(0, 2))
  };
};
