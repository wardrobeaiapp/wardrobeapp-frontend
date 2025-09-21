import { WardrobeItem, ItemCategory, Season } from '../../../types';
import type { Scenario } from '../../scenarios/types';

/**
 * Generate scenario coverage data for AI analysis
 * Centralizes the logic for different item types (outerwear, accessories, regular items)
 */
export async function generateScenarioCoverage(
  userId: string,
  formData: { category?: string; seasons?: string[] },
  scenarios: Scenario[],
  wardrobeItems: WardrobeItem[]
): Promise<any[] | null> {
  
  if (!formData?.category || !formData?.seasons || formData.seasons.length === 0) {
    console.log('[coverageService] Missing required form data for coverage calculation');
    return null;
  }
  
  console.log(`[coverageService] Calculating coverage for ${formData.category} in seasons: ${formData.seasons.join(',')}`);
  
  try {
    const isOuterwear = formData.category.toLowerCase() === 'outerwear';
    const isAccessory = formData.category.toLowerCase() === 'accessory';
    
    if (isOuterwear) {
      return await generateOuterwearCoverage(userId, formData.seasons as Season[]);
    } else if (isAccessory) {
      return await generateAccessoryCoverage(userId, formData.seasons as Season[]);
    } else {
      return await generateRegularItemCoverage(
        userId, 
        formData.category as ItemCategory,
        formData.seasons as Season[],
        scenarios,
        wardrobeItems
      );
    }
    
  } catch (error) {
    console.error('[coverageService] Failed to calculate coverage:', error);
    return null;
  }
}

/**
 * Generate outerwear seasonal coverage (scenario-agnostic)
 */
async function generateOuterwearCoverage(userId: string, seasons: Season[]): Promise<any[]> {
  console.log(`[coverageService] Using SEASONAL coverage for outerwear`);
  
  const { getOuterwearSeasonalCoverageForAI } = await import('../../wardrobe/scenarioCoverage/category/queries');
  
  const allCoveragePromises = seasons.map(season => 
    getOuterwearSeasonalCoverageForAI(userId, season)
  );
  
  const allSeasonsCoverage = await Promise.all(allCoveragePromises);
  const coverage = allSeasonsCoverage.flat();
  
  console.log(`[coverageService] Generated SEASONAL outerwear coverage for ${seasons.length} seasons: ${coverage.length} total coverage entries`);
  
  // Log seasonal coverage
  coverage.forEach((cov: any) => {
    console.log(`[coverageService] Seasonal Coverage: ${cov.scenarioName} - ${cov.season}: ${cov.coveragePercent}%`);
  });
  
  return coverage;
}

/**
 * Generate accessory seasonal coverage (scenario-agnostic)
 */
async function generateAccessoryCoverage(userId: string, seasons: Season[]): Promise<any[]> {
  console.log(`[coverageService] Using SEASONAL coverage for accessories`);
  
  const { getAccessorySeasonalCoverageForAI } = await import('../../wardrobe/scenarioCoverage/category/queries');
  
  const allCoveragePromises = seasons.map(season => 
    getAccessorySeasonalCoverageForAI(userId, season)
  );
  
  const allSeasonsCoverage = await Promise.all(allCoveragePromises);
  const coverage = allSeasonsCoverage.flat();
  
  console.log(`[coverageService] Generated SEASONAL accessory coverage for ${seasons.length} seasons: ${coverage.length} total coverage entries`);
  
  // Log seasonal coverage  
  coverage.forEach((cov: any) => {
    console.log(`[coverageService] Seasonal Coverage: ${cov.scenarioName} - ${cov.season}: ${cov.coveragePercent}%`);
  });
  
  return coverage;
}

/**
 * Generate regular item scenario coverage 
 */
async function generateRegularItemCoverage(
  userId: string,
  category: ItemCategory,
  seasons: Season[],
  scenarios: Scenario[],
  wardrobeItems: WardrobeItem[]
): Promise<any[]> {
  
  if (scenarios.length === 0) {
    console.log('[coverageService] No scenarios available for regular item coverage');
    return [];
  }
  
  console.log(`[coverageService] Using SCENARIO coverage for regular items`);
  
  const { getCategoryCoverageForAI } = await import('../../wardrobe/scenarioCoverage/category/queries');
  
  const allCoveragePromises = seasons.map(season => 
    getCategoryCoverageForAI(userId, category, season, scenarios, wardrobeItems)
  );
  
  const allSeasonsCoverage = await Promise.all(allCoveragePromises);
  const coverage = allSeasonsCoverage.flat();
  
  console.log(`[coverageService] Generated scenario coverage for ${seasons.length} seasons: ${coverage.length} total coverage entries`);
  
  // Group by scenario and show coverage per season
  const coverageByScenario = coverage.reduce((acc: Record<string, any[]>, cov) => {
    const key = cov.scenarioName;
    if (!acc[key]) acc[key] = [];
    acc[key].push(cov);
    return acc;
  }, {});
  
  Object.entries(coverageByScenario).forEach(([scenarioName, coverages]) => {
    const seasonCoverages = (coverages as any[]).map(c => 
      `${c.season}: ${(c as any).coveragePercent || (c as any).coveragePercentage || 0}%`
    ).join(', ');
    console.log(`[coverageService] Coverage: ${scenarioName} - [${seasonCoverages}]`);
  });
  
  return coverage;
}
