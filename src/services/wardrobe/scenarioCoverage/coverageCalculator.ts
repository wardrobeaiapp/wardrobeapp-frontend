import { WardrobeItem, Scenario } from '../../../types';

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
  season: string = 'all' // Add season parameter with default value 'all'
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
    const scenarioItems = items.filter(item => 
      item.scenarios?.includes(scenario.id)
    );

    const categoryCoverage = Object.entries(itemsByCategory).map(([category, categoryItems]) => {
      const matchedItems = categoryItems.filter(item => 
        item.scenarios?.includes(scenario.id)
      );
      
      return {
        category,
        total: categoryItems.length,
        matched: matchedItems.length,
        coverage: categoryItems.length > 0 
          ? Math.round((matchedItems.length / categoryItems.length) * 100) 
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
