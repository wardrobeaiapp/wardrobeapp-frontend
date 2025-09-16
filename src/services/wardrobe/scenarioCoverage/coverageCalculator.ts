import { WardrobeItem, Scenario, Season } from '../../../types';

export type CategoryCoverage = {
  category: string;
  total: number;
  matched: number;
  coverage: number;
};

export type ScenarioCoverage = {
  scenarioId: string;
  scenarioName: string;
  season: string;  // Added season field
  totalItems: number;
  matchedItems: number;
  overallCoverage: number;
  categoryCoverage: CategoryCoverage[];
  lastUpdated: string;
};

/**
 * Calculate scenario coverage based on wardrobe items
 */
export const calculateScenarioCoverage = async (
  userId: string,
  items: WardrobeItem[],
  scenarios: Scenario[],
  season: Season // Now requires a specific season, no more 'all'
): Promise<ScenarioCoverage[]> => {
  console.log('🟦 SCENARIO COVERAGE - Calculating coverage for', items.length, 'items and', scenarios.length, 'scenarios');
  
  // Group items by category
  const itemsByCategory = items.reduce<Record<string, WardrobeItem[]>>((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

  // Calculate coverage for each scenario
  const coverageResults = scenarios.map(scenario => {
    // Filter items by both scenario and season
    const scenarioItems = items.filter(item => {
      const matchesScenario = item.scenarios?.includes(scenario.id) || false;
      const matchesSeason = 
        !item.season || 
        item.season.length === 0 || 
        item.season.includes(season);
      return matchesScenario && matchesSeason;
    });

    const categoryCoverage = Object.entries(itemsByCategory).map(([category, categoryItems]) => {
      // Filter category items by season
      const seasonFilteredItems = categoryItems.filter(item => {
        return !item.season || 
               item.season.length === 0 || 
               item.season.includes(season);
      });

      // Then, filter by scenario within the season-filtered items
      const matchedItems = seasonFilteredItems.filter(item => {
        return item.scenarios?.includes(scenario.id) || false;
      });
      
      // Calculate coverage based on season-filtered items, not all items in category
      const totalInSeason = seasonFilteredItems.length;
      const matchedCount = matchedItems.length;
      
      return {
        category,
        total: totalInSeason,
        matched: matchedCount,
        coverage: totalInSeason > 0 
          ? Math.round((matchedCount / totalInSeason) * 100) 
          : 0
      };
    });

    const totalItems = items.length;
    const matchedItems = scenarioItems.length;
    const overallCoverage = totalItems > 0 
      ? Math.round((matchedItems / totalItems) * 100)
      : 0;

    return {
      scenarioId: scenario.id,
      scenarioName: scenario.name,
      season,
      totalItems,
      matchedItems,
      overallCoverage,
      categoryCoverage,
      lastUpdated: new Date().toISOString()
    };
  });

  console.log('🟢 SCENARIO COVERAGE - Coverage calculation complete');
  return coverageResults;
};
