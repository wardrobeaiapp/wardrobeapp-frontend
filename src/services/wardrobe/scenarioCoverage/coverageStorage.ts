import { supabase } from '../../core';
import { ScenarioCoverage } from './coverageCalculator';

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
      .upsert(records, { onConflict: 'user_id,scenario_id' })
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
    totalItems: row.total_items,
    matchedItems: row.matched_items,
    overallCoverage: row.coverage_percent,
    categoryCoverage: row.category_breakdown || [],
    lastUpdated: row.last_updated
  }));
};
