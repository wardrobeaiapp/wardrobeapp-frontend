import { WardrobeItem, Scenario, Season, ItemCategory } from '../../../../types';
import { supabase } from '../../../core';
import { CategoryCoverage, ALL_SEASONS } from './types';
import { calculateCategoryCoverage } from './calculations';
import { saveCategoryCoverage, mapDatabaseRowToCategoryCoverage } from './database';

/**
 * Get category coverage for AI prompts - calculates missing combinations on-demand
 */
export const getCategoryCoverageForAI = async (
  userId: string,
  category: ItemCategory,
  season?: Season,
  scenarios?: Scenario[],
  items?: WardrobeItem[]
): Promise<CategoryCoverage[]> => {
  console.log(`🟦 AI QUERY - Fetching ${category} coverage for user ${userId}`);

  let query = supabase
    .from('scenario_coverage_by_category')
    .select('*')
    .eq('user_id', userId)
    .eq('category', category);

  if (season) {
    query = query.eq('season', season);
  }

  const { data: existingData, error } = await query.order('priority_level', { ascending: true });

  if (error) {
    console.error('🔴 Failed to fetch category coverage for AI:', error);
    throw error;
  }

  const existingCoverage = (existingData || []).map(mapDatabaseRowToCategoryCoverage);

  // If we have scenarios and items available, check for missing combinations and calculate them
  if (scenarios && items) {
    const seasonsToCheck = season ? [season] : ALL_SEASONS;
    const existingKeys = new Set(
      existingCoverage.map(c => `${c.scenarioId}_${c.season}`)
    );

    const missingCombinations: CategoryCoverage[] = [];

    for (const scenario of scenarios) {
      for (const seasonToCheck of seasonsToCheck) {
        const key = `${scenario.id}_${seasonToCheck}`;
        
        if (!existingKeys.has(key)) {
          console.log(`🔄 AI QUERY - Computing missing coverage: ${scenario.name}/${seasonToCheck}/${category}`);
          
          // Calculate missing coverage on-demand
          const missingCoverage = await calculateCategoryCoverage(
            userId,
            scenario.id,
            scenario.name,
            scenario.frequency || '',
            seasonToCheck as Season,
            category,
            items
          );
          
          missingCombinations.push(missingCoverage);
          
          // Optionally save to database for future queries (cache it)
          await saveCategoryCoverage(missingCoverage);
        }
      }
    }

    // Combine existing and calculated data
    const allCoverage = [...existingCoverage, ...missingCombinations];
    return allCoverage.sort((a, b) => a.priorityLevel - b.priorityLevel);
  }

  return existingCoverage;
};

/**
 * Get critical gaps across all categories - for dashboard/alerts
 */
export const getCriticalCoverageGaps = async (userId: string): Promise<CategoryCoverage[]> => {
  const { data, error } = await supabase
    .from('scenario_coverage_by_category')
    .select('*')
    .eq('user_id', userId)
    .eq('is_critical', true)
    .order('priority_level', { ascending: true })
    .limit(10);

  if (error) {
    console.error('🔴 Failed to fetch critical gaps:', error);
    throw error;
  }

  return (data || []).map(mapDatabaseRowToCategoryCoverage);
};
