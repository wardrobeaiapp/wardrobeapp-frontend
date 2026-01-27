import { WardrobeItem } from '../../types';

/**
 * Filter pre-filled data to only include descriptive fields relevant for AI analysis
 * Excludes metadata fields like imageUrl, id, userId, timestamps, etc.
 * @param preFilledData - Wardrobe item data to filter
 * @returns Filtered data with only AI-relevant fields
 */
export const filterPreFilledData = (preFilledData: WardrobeItem) => {
  const filtered: Partial<WardrobeItem> = {};
  
  // Include only descriptive fields that AI can verify from the image
  if (preFilledData.name) filtered.name = preFilledData.name;
  if (preFilledData.category) filtered.category = preFilledData.category;
  if (preFilledData.subcategory) filtered.subcategory = preFilledData.subcategory;
  if (preFilledData.color) filtered.color = preFilledData.color;
  if (preFilledData.style) filtered.style = preFilledData.style;
  if (preFilledData.silhouette) filtered.silhouette = preFilledData.silhouette;
  if (preFilledData.type !== undefined && preFilledData.type !== null) filtered.type = preFilledData.type;
  if (preFilledData.material) filtered.material = preFilledData.material;
  if (preFilledData.pattern) filtered.pattern = preFilledData.pattern;
  if (preFilledData.length) filtered.length = preFilledData.length;
  if (preFilledData.sleeves) filtered.sleeves = preFilledData.sleeves;
  if (preFilledData.rise) filtered.rise = preFilledData.rise;
  if (preFilledData.neckline) filtered.neckline = preFilledData.neckline;
  if (preFilledData.heelHeight) filtered.heelHeight = preFilledData.heelHeight;
  if (preFilledData.bootHeight) filtered.bootHeight = preFilledData.bootHeight;
  if (preFilledData.brand) filtered.brand = preFilledData.brand;
  if (preFilledData.size) filtered.size = preFilledData.size;
  if (preFilledData.details) filtered.details = preFilledData.details; // CRITICAL: Include styling details like "balloon sleeves"
  if (preFilledData.season) filtered.season = preFilledData.season;
  
  // CRITICAL: Include scenarios for wishlist items - these are the user's pre-selected scenarios
  if (preFilledData.scenarios) filtered.scenarios = preFilledData.scenarios;
  
  // CRITICAL: Include id to distinguish existing wardrobe items from new items
  // This prevents duplicate AI history records
  if (preFilledData.id) filtered.id = preFilledData.id;
  
  // Explicitly exclude metadata fields:
  // - imageUrl: AI already has the image
  // - userId: Not descriptive of the item
  // - dateAdded, imageExpiry: Timestamps irrelevant for analysis
  // - wishlist: Not about the item itself
  // - tags: Complex object, not needed for basic verification
  
  return filtered;
};

/**
 * Process scenario conversion for wishlist items
 * Converts scenario UUIDs to names for AI analysis
 * @param preFilledData - Pre-filled wardrobe item data
 * @param scenarios - Available scenarios from user data
 * @returns Processed pre-filled data with scenario names instead of UUIDs
 */
export const processScenarioConversion = (
  preFilledData: WardrobeItem | undefined, 
  scenarios: Array<{ id: string; name: string }> | undefined
): WardrobeItem | undefined => {
  if (!preFilledData || !preFilledData.scenarios || preFilledData.scenarios.length === 0 || !scenarios || scenarios.length === 0) {
    return preFilledData;
  }

  console.log('[aiDataProcessor] 🔄 Converting wishlist scenario UUIDs to names');
  const processedPreFilledData = {
    ...preFilledData,
    scenarios: preFilledData.scenarios.map(scenarioId => {
      const scenario = scenarios.find(s => s.id === scenarioId);
      const scenarioName = scenario ? scenario.name : scenarioId;
      console.log(`[aiDataProcessor] Converting UUID ${scenarioId} → Name: ${scenarioName}`);
      return scenarioName;
    })
  };
  console.log('[aiDataProcessor] ✅ Converted scenarios:', processedPreFilledData.scenarios);
  
  return processedPreFilledData;
};

/**
 * Filter scenario coverage for wishlist items
 * Only include coverage for scenarios that are relevant to the wishlist item
 * @param scenarioCoverage - Full scenario coverage data
 * @param wishlistScenarios - Scenarios selected for the wishlist item
 * @returns Filtered scenario coverage data
 */
export const filterScenarioCoverageForWishlist = (
  scenarioCoverage: any[] | null | undefined,
  wishlistScenarios: string[] | undefined
): any[] | null | undefined => {
  if (!scenarioCoverage || !wishlistScenarios || wishlistScenarios.length === 0) {
    return scenarioCoverage;
  }

  console.log('[aiDataProcessor] Original coverage scenarios:', scenarioCoverage.map(c => c.scenarioName));
  
  const filteredCoverage = scenarioCoverage.filter(coverage => {
    // Always include "All scenarios" coverage (e.g. outerwear)
    if (coverage.scenarioName.toLowerCase().includes('all scenarios')) {
      return true;
    }
    // Include only the scenarios selected for this wishlist item
    return wishlistScenarios.includes(coverage.scenarioName);
  });
  
  console.log('[aiDataProcessor] ✅ Filtered coverage to scenarios:', filteredCoverage.map(c => c.scenarioName));
  console.log('[aiDataProcessor] Reduced from ALL scenarios to', filteredCoverage.length, 'relevant scenarios');
  
  return filteredCoverage;
};
