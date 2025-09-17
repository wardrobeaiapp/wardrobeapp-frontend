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
    scenario_frequency: coverage.scenarioFrequency,
    season: coverage.season,
    category: coverage.category,
    current_items: coverage.currentItems,
    needed_items_min: coverage.neededItemsMin,
    needed_items_ideal: coverage.neededItemsIdeal,
    needed_items_max: coverage.neededItemsMax,
    coverage_percent: coverage.coveragePercent,
    gap_count: coverage.gapCount,
    is_critical: coverage.isCritical,
    is_bottleneck: coverage.isBottleneck,
    priority_level: coverage.priorityLevel,
    category_recommendations: coverage.categoryRecommendations,
    separates_focused_target: coverage.separatesFocusedTarget,
    dress_focused_target: coverage.dressFocusedTarget,
    balanced_target: coverage.balancedTarget,
    last_updated: coverage.lastUpdated
  };

  const { error } = await supabase
    .from('scenario_coverage_by_category')
    .upsert(record, { onConflict: 'user_id,scenario_id,season,category' });

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
    scenarioFrequency: row.scenario_frequency,
    season: row.season,
    category: row.category,
    currentItems: row.current_items,
    neededItemsMin: row.needed_items_min,
    neededItemsIdeal: row.needed_items_ideal,
    neededItemsMax: row.needed_items_max,
    coveragePercent: row.coverage_percent,
    gapCount: row.gap_count,
    isCritical: row.is_critical,
    isBottleneck: row.is_bottleneck,
    priorityLevel: row.priority_level,
    categoryRecommendations: row.category_recommendations || [],
    separatesFocusedTarget: row.separates_focused_target,
    dressFocusedTarget: row.dress_focused_target,
    balancedTarget: row.balanced_target,
    lastUpdated: row.last_updated
  };
}
