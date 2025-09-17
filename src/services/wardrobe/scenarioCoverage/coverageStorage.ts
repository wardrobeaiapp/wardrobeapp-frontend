import { supabase } from '../../core';
import { Season } from '../../../types';
import { ScenarioCoverage } from './coverageCalculator';
import { NeedsBasedScenarioCoverage } from './needsBasedCoverageCalculator';

// Table name without schema - Supabase will use the default schema (public)
const COVERAGE_TABLE = 'scenario_coverage';

/**
 * Save scenario coverage results to the database
 */
export const saveScenarioCoverage = async (
  userId: string,
  coverageResults: ScenarioCoverage[]
): Promise<void> => {
  console.log('🟦 SCENARIO COVERAGE - Saving coverage results to database');
  
  const records = coverageResults.map(result => ({
    user_id: userId,
    scenario_id: result.scenarioId,
    scenario_name: result.scenarioName,
    season: result.season || 'all', // Ensure season is included, default to 'all'
    total_items: result.totalItems,
    matched_items: result.matchedItems,
    coverage_percent: result.overallCoverage,
    category_breakdown: result.categoryCoverage,
    last_updated: result.lastUpdated
  }));

  try {
    console.log('🟦 SCENARIO COVERAGE - Attempting to upsert records:', records);
    const { data, error } = await supabase
      .from(COVERAGE_TABLE)
      .upsert(records, { onConflict: 'user_id,scenario_id,season' })
      .select();

    if (error) {
      console.error('🔴 SCENARIO COVERAGE - Failed to save coverage results:', {
        error,
        table: COVERAGE_TABLE,
        recordCount: records.length,
        firstRecord: records[0]
      });
      throw error;
    }

    console.log('🟢 SCENARIO COVERAGE - Upsert successful, response:', data);
  } catch (err) {
    console.error('🔴 SCENARIO COVERAGE - Unexpected error in saveScenarioCoverage:', {
      error: err,
      table: COVERAGE_TABLE,
      records
    });
    throw err;
  }

  console.log('🟢 SCENARIO COVERAGE - Successfully saved coverage results');
};

/**
 * Save needs-based scenario coverage results to the database
 */
export const saveNeedsBasedScenarioCoverage = async (
  userId: string,
  coverageResults: NeedsBasedScenarioCoverage[]
): Promise<void> => {
  console.log('🟦 NEEDS COVERAGE - Saving needs-based coverage results to database');
  
  const records = coverageResults.map(result => ({
    user_id: userId,
    scenario_id: result.scenarioId,
    scenario_name: result.scenarioName,
    season: result.season,
    // Updated fields for needs-based analysis
    target_outfits: result.targetOutfits,
    current_outfits: result.currentOutfits,
    coverage_percent: result.coverage,
    gap_count: result.gapCount,
    bottleneck_category: result.bottleneckCategory,
    missing_categories: result.missingCategories,
    recommendations: result.recommendations,
    outfit_analysis: result.outfitAnalysis,
    last_updated: result.lastUpdated,
    // Legacy fields for backward compatibility
    total_items: result.outfitAnalysis.possibleOutfits, // Map to existing field
    matched_items: result.outfitAnalysis.possibleOutfits, // Map to existing field
    category_breakdown: result.outfitAnalysis.completeCombinations
  }));

  try {
    console.log('🟦 NEEDS COVERAGE - Attempting to upsert records:', records);
    const { data, error } = await supabase
      .from(COVERAGE_TABLE)
      .upsert(records, { onConflict: 'user_id,scenario_id,season' })
      .select();

    if (error) {
      console.error('🔴 NEEDS COVERAGE - Failed to save coverage results:', {
        error,
        table: COVERAGE_TABLE,
        recordCount: records.length,
        firstRecord: records[0]
      });
      throw error;
    }

    console.log('🟢 NEEDS COVERAGE - Upsert successful, response:', data);
  } catch (err) {
    console.error('🔴 NEEDS COVERAGE - Unexpected error in saveNeedsBasedScenarioCoverage:', {
      error: err,
      table: COVERAGE_TABLE,
      records
    });
    throw err;
  }

  console.log('🟢 NEEDS COVERAGE - Successfully saved needs-based coverage results');
};

/**
 * Get scenario coverage for a user
 */
export const getScenarioCoverage = async (userId: string): Promise<ScenarioCoverage[]> => {
  console.log('🟦 SCENARIO COVERAGE - Fetching coverage for user:', userId);
  
  const { data, error } = await supabase
    .from(COVERAGE_TABLE)
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('🔴 SCENARIO COVERAGE - Failed to fetch coverage:', error);
    throw error;
  }

  console.log('🟢 SCENARIO COVERAGE - Successfully fetched coverage');
  
  return (data || []).map((row: any) => ({
    scenarioId: row.scenario_id,
    scenarioName: row.scenario_name,
    season: row.season || 'all', // Default to 'all' for backward compatibility
    totalItems: row.total_items,
    matchedItems: row.matched_items,
    overallCoverage: row.coverage_percent,
    categoryCoverage: row.category_breakdown || [],
    lastUpdated: row.last_updated
  }));
};

/**
 * Get needs-based scenario coverage for a user
 */
export const getNeedsBasedScenarioCoverage = async (
  userId: string, 
  season?: Season
): Promise<NeedsBasedScenarioCoverage[]> => {
  console.log('🟦 NEEDS COVERAGE - Fetching needs-based coverage for user:', userId, season ? `season: ${season}` : '');
  
  let query = supabase
    .from(COVERAGE_TABLE)
    .select('*')
    .eq('user_id', userId);

  if (season) {
    query = query.eq('season', season);
  }

  const { data, error } = await query;

  if (error) {
    console.error('🔴 NEEDS COVERAGE - Failed to fetch coverage:', error);
    throw error;
  }

  console.log('🟢 NEEDS COVERAGE - Successfully fetched needs-based coverage');
  
  return (data || []).map((row: any) => ({
    scenarioId: row.scenario_id,
    scenarioName: row.scenario_name,
    season: row.season,
    targetOutfits: row.target_outfits || row.total_items || 0, // Fallback to old field
    currentOutfits: row.current_outfits || row.matched_items || 0, // Fallback to old field
    coverage: row.coverage_percent || 0,
    gapCount: row.gap_count || 0,
    bottleneckCategory: row.bottleneck_category,
    missingCategories: row.missing_categories || [],
    recommendations: row.recommendations || [],
    outfitAnalysis: row.outfit_analysis || {
      scenarioId: row.scenario_id,
      scenarioName: row.scenario_name,
      season: row.season,
      targetQuantity: row.target_outfits || 0,
      possibleOutfits: row.current_outfits || 0,
      coverage: row.coverage_percent || 0,
      completeCombinations: row.category_breakdown || [],
      missingCategories: row.missing_categories || [],
      recommendations: row.recommendations || []
    },
    lastUpdated: row.last_updated
  }));
};
