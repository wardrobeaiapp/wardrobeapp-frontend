import { supabase } from '../../../core';
import { CategoryCoverage } from './types';

/**
 * Save category coverage to database
 */
export const saveCategoryCoverage = async (coverage: CategoryCoverage): Promise<void> => {
  const record = {
    user_id: coverage.userId,
    scenario_id: coverage.scenarioId,
    scenario_name: coverage.scenarioName,
    season: coverage.season,
    category: coverage.category,
    subcategory: coverage.subcategory,
    current_items: coverage.currentItems,
    needed_items_min: coverage.neededItemsMin,
    needed_items_ideal: coverage.neededItemsIdeal,
    needed_items_max: coverage.neededItemsMax,
    coverage_percent: coverage.coveragePercent,
    gap_count: coverage.gapCount,
    gap_type: coverage.gapType,
    priority_level: coverage.priorityLevel,
    last_updated: coverage.lastUpdated
  };

  // Manual upsert: check if record exists first, then insert or update
  let query = supabase
    .from('wardrobe_coverage')
    .select('id')
    .eq('user_id', coverage.userId)
    .eq('season', coverage.season)
    .eq('category', coverage.category);
  
  // Handle NULL values properly for scenario_id and subcategory
  if (coverage.scenarioId === null) {
    query = query.is('scenario_id', null);
  } else {
    query = query.eq('scenario_id', coverage.scenarioId);
  }
  
  if (coverage.subcategory === null || coverage.subcategory === undefined) {
    query = query.is('subcategory', null);
  } else {
    query = query.eq('subcategory', coverage.subcategory);
  }
  
  const { data: existing } = await query.limit(1).single();

  let error;
  if (existing && (existing as any).id) {
    // Update existing record
    const { error: updateError } = await supabase
      .from('wardrobe_coverage')
      .update(record)
      .eq('id', (existing as any).id);
    error = updateError;
    console.log(`🔄 Updated existing coverage record for ${coverage.category}${coverage.subcategory ? `/${coverage.subcategory}` : ''}`);
  } else {
    // Insert new record
    const { error: insertError } = await supabase
      .from('wardrobe_coverage')
      .insert(record);
    error = insertError;
    console.log(`➕ Created new coverage record for ${coverage.category}${coverage.subcategory ? `/${coverage.subcategory}` : ''}`);
  }

  if (error) {
    console.error('🔴 Failed to save category coverage:', error);
    throw error;
  }
};

/**
 * Map database row to CategoryCoverage object
 */
export function mapDatabaseRowToCategoryCoverage(row: any): CategoryCoverage {
  return {
    userId: row.user_id,
    scenarioId: row.scenario_id,
    scenarioName: row.scenario_name,
    season: row.season,
    category: row.category,
    subcategory: row.subcategory,
    currentItems: row.current_items,
    neededItemsMin: row.needed_items_min,
    neededItemsIdeal: row.needed_items_ideal,
    neededItemsMax: row.needed_items_max,
    coveragePercent: row.coverage_percent,
    gapCount: row.gap_count,
    gapType: row.gap_type || 'improvement', // Default for existing data
    priorityLevel: row.priority_level,
    lastUpdated: row.last_updated
  };
}
