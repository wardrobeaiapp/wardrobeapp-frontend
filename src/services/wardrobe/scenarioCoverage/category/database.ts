import { supabase } from '../../../core';
import { CategoryCoverage } from './types';

/**
 * Save category coverage to database
 */
export async function saveCategoryCoverage(coverage: CategoryCoverage): Promise<void> {
  const record = {
    user_id: coverage.userId,
    scenario_id: coverage.scenarioId,
    scenario_name: coverage.scenarioName,
    season: coverage.season,
    category: coverage.category,
    subcategory: coverage.subcategory || null,
    current_items: coverage.currentItems,
    needed_items_min: coverage.neededItemsMin,
    needed_items_ideal: coverage.neededItemsIdeal,
    needed_items_max: coverage.neededItemsMax,
    coverage_percent: coverage.coveragePercent,
    gap_count: coverage.gapCount,
    gap_type: coverage.gapType,
    is_critical: coverage.isCritical,
    priority_level: coverage.priorityLevel,
    last_updated: coverage.lastUpdated
  };

  const { error } = await supabase
    .from('scenario_coverage_by_category')
    .upsert(record, { onConflict: 'user_id,scenario_id,season,category,subcategory' });

  if (error) {
    console.error('🔴 Failed to save category coverage:', error);
    throw error;
  }
}

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
    isCritical: row.is_critical,
    priorityLevel: row.priority_level,
    lastUpdated: row.last_updated
  };
}
