import { WardrobeItem, Scenario, Season, ItemCategory } from '../../../../types';
import { ALL_SEASONS, CategoryCoverage } from './types';
import { calculateCategoryCoverage } from './calculations';
import { saveCategoryCoverage } from './database';


// Re-export query functions for AI
export { getCategoryCoverageForAI, getCriticalCoverageGaps } from './queries';

/**
 * Update coverage for a single category (efficient selective update)
 */
export const updateCategoryCoverage = async (
  userId: string,
  scenarioId: string | null,
  scenarioName: string,
  scenarioFrequency: string,
  season: Season,
  category: ItemCategory,
  items: WardrobeItem[]
): Promise<void> => {
  const coverageResult = await calculateCategoryCoverage(
    userId, scenarioId, scenarioName, scenarioFrequency, season, category, items
  );
  
  // Handle both single coverage and array of coverages
  if (Array.isArray(coverageResult)) {
    // Accessories - array of subcategory coverage records
    for (const coverage of coverageResult) {
      await saveCategoryCoverage(coverage);
    }
  } else {
    // Regular categories - single coverage record
    await saveCategoryCoverage(coverageResult);
  }
};

/**
 * Update coverage for all categories in a scenario (when adding new scenarios)
 */
export const updateAllCategoriesForScenario = async (
  userId: string,
  scenario: Scenario,
  season: Season,
  items: WardrobeItem[]
): Promise<void> => {
  const categories: ItemCategory[] = [
    ItemCategory.TOP, 
    ItemCategory.BOTTOM, 
    ItemCategory.ONE_PIECE, 
    ItemCategory.OUTERWEAR, 
    ItemCategory.FOOTWEAR, 
    ItemCategory.ACCESSORY,
    ItemCategory.OTHER
  ];
  
  const coveragePromises = categories.map(category => 
    updateCategoryCoverage(
      userId, 
      scenario.id, 
      scenario.name, 
      scenario.frequency || '',
      season, 
      category, 
      items
    )
  );

  await Promise.all(coveragePromises);
};

/**
 * Initialize coverage for a new scenario (called when user creates scenario)
 * Creates coverage rows for current season + critical categories only
 */
export const initializeNewScenarioCoverage = async (
  userId: string,
  scenario: Scenario,
  currentSeason: Season,
  items: WardrobeItem[]
): Promise<void> => {
  console.log(`🟦 INIT SCENARIO - Creating coverage for new scenario: ${scenario.name}`);
  
  // Initialize current season for all categories (for immediate AI insights)
  const categories: ItemCategory[] = [
    ItemCategory.TOP, 
    ItemCategory.BOTTOM, 
    ItemCategory.ONE_PIECE, 
    ItemCategory.OUTERWEAR, 
    ItemCategory.FOOTWEAR, 
    ItemCategory.ACCESSORY,
    ItemCategory.OTHER
  ];

  const initPromises = categories.map(category => 
    updateCategoryCoverage(
      userId,
      scenario.id,
      scenario.name,
      scenario.frequency || '',
      currentSeason,
      category,
      items
    )
  );

  await Promise.all(initPromises);
  
  console.log(`🟢 INIT SCENARIO - Created ${categories.length} coverage entries for ${scenario.name}/${currentSeason}`);
};

/**
 * Initialize complete coverage matrix for a user (useful for new users or data rebuilds)
 */
export const initializeCompleteCoverageMatrix = async (
  userId: string,
  scenarios: Scenario[],
  items: WardrobeItem[]
): Promise<void> => {
  console.log('🟦 INIT COVERAGE - Creating complete coverage matrix for user');
  
  const seasons = ALL_SEASONS;
  const categories: ItemCategory[] = [
    ItemCategory.TOP, 
    ItemCategory.BOTTOM, 
    ItemCategory.ONE_PIECE, 
    ItemCategory.OUTERWEAR, 
    ItemCategory.FOOTWEAR, 
    ItemCategory.ACCESSORY,
    ItemCategory.OTHER
  ];

  const initPromises: Promise<void>[] = [];

  for (const scenario of scenarios) {
    for (const season of seasons) {
      for (const category of categories) {
        initPromises.push(
          updateCategoryCoverage(
            userId,
            scenario.id,
            scenario.name,
            scenario.frequency || '',
            season,
            category,
            items
          )
        );
      }
    }
  }

  await Promise.all(initPromises);
  
  const totalCombinations = scenarios.length * seasons.length * categories.length;
  console.log(`🟢 INIT COVERAGE - Initialized ${totalCombinations} coverage combinations for user`);
};
