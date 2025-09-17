import { WardrobeItem, Scenario, Season } from '../../../types';
import { calculateScenarioCoverage } from './coverageCalculator';
import { saveScenarioCoverage } from './coverageStorage';
import { calculateFrequencyBasedNeeds, FrequencyBasedNeed } from './frequencyBasedNeedsCalculator';
import { supabase } from '../../core';

export { calculateScenarioCoverage } from './coverageCalculator';
export type { CategoryCoverage, ScenarioCoverage } from './coverageCalculator';

export class ScenarioCoverageService {
  private static instance: ScenarioCoverageService;
  
  private constructor() {}

  public static getInstance(): ScenarioCoverageService {
    if (!ScenarioCoverageService.instance) {
      ScenarioCoverageService.instance = new ScenarioCoverageService();
    }
    return ScenarioCoverageService.instance;
  }

  /**
   * Recalculate and save scenario coverage using frequency-based method
   */
  public async updateScenarioCoverage(
    userId: string,
    items: WardrobeItem[],
    scenarios: Scenario[],
    season: Season
  ): Promise<void> {
    try {
      console.log('🟦 SCENARIO COVERAGE - Starting frequency-based coverage update');
      
      // Calculate frequency-based needs
      const frequencyResults = await calculateFrequencyBasedNeeds(userId, items, scenarios, season);
      
      // Save to database (convert to database format)
      await this.saveFrequencyBasedToScenarioCoverageTable(userId, frequencyResults);
      
      console.log('🟢 SCENARIO COVERAGE - Frequency-based coverage update completed successfully');
    } catch (error) {
      console.error('🔴 SCENARIO COVERAGE - Error updating coverage:', error);
      throw error;
    }
  }

  /**
   * Save frequency-based results to the existing scenario_coverage table
   */
  private async saveFrequencyBasedToScenarioCoverageTable(
    userId: string,
    frequencyResults: FrequencyBasedNeed[]
  ): Promise<void> {
    console.log('🟦 SCENARIO COVERAGE - Converting frequency-based data for database');
    
    const records = frequencyResults.map(result => {
      // Calculate coverage level (0-5 scale) from percentage
      const coverageLevel = Math.min(5, Math.floor((result.overallCoverage / 100) * 5));
      
      // Create outfit breakdown by counting different outfit types
      const outfitBreakdown = {
        topBottomCombos: Math.min(result.currentItems.top, result.currentItems.bottom),
        dresses: result.currentItems.one_piece,
        total: result.possibleOutfits,
        strategies: result.outfitStrategies,
        categoryCoverage: result.categoryCoverage // Add category-specific coverage
      };

      // Determine bottleneck category - prioritize essential categories with 0 items
      const essentialCategories = ['footwear', 'top', 'bottom', 'one_piece'] as const;
      const criticalMissing = essentialCategories.filter(cat => result.currentItems[cat as keyof typeof result.currentItems] === 0);
      
      let bottleneck: string | undefined;
      let missingForNextOutfit: string;
      
      if (criticalMissing.length > 0) {
        // Priority: Essential categories with 0 items
        bottleneck = criticalMissing[0];
        const isFootwear = bottleneck === 'footwear';
        missingForNextOutfit = `Critical: Add ${isFootwear ? 'shoes' : bottleneck} - you can't wear outfits without ${isFootwear ? 'footwear' : bottleneck}`;
      } else {
        // Secondary: Categories with the biggest gaps
        const categoryGaps = Object.entries(result.gaps).filter(([_, gap]) => gap > 0);
        if (categoryGaps.length > 0) {
          const sortedGaps = categoryGaps.sort(([_, a], [__, b]) => b - a);
          bottleneck = sortedGaps[0][0];
          missingForNextOutfit = `Add ${sortedGaps[0][1]} more ${bottleneck} to increase outfit options`;
        } else {
          bottleneck = undefined;
          missingForNextOutfit = 'You have sufficient items for this scenario';
        }
      }

      return {
        user_id: userId,
        scenario_id: result.scenarioId,
        scenario_name: result.scenarioName,
        season: result.season,
        // Map to existing columns with correct semantics
        total_items: Object.values(result.currentItems).reduce((sum, count) => sum + count, 0), // Total items for scenario
        matched_items: Object.values(result.currentItems).reduce((sum, count) => sum + count, 0), // Items matching scenario (same as total in our case)
        coverage_percent: Math.min(999.99, Math.max(0, result.overallCoverage)), // Cap to database limit
        category_breakdown: outfitBreakdown,
        last_updated: new Date().toISOString(),
        // New columns (will be ignored if they don't exist)
        ...(result.frequency && { scenario_frequency: result.frequency }),
        total_outfits: result.possibleOutfits,
        coverage_level: coverageLevel,
        outfit_breakdown: outfitBreakdown,
        bottleneck: bottleneck,
        missing_for_next_outfit: missingForNextOutfit,
        item_counts: result.currentItems
      };
    });

    try {
      console.log('📝 SCENARIO COVERAGE - About to upsert records:', {
        recordCount: records.length,
        sampleRecord: records[0],
        tableName: 'scenario_coverage'
      });

      const { data, error } = await supabase
        .from('scenario_coverage')
        .upsert(records, { onConflict: 'user_id,scenario_id,season' })
        .select();

      if (error) {
        console.error('🔴 SCENARIO COVERAGE - Failed to save frequency-based results:', {
          error,
          records: records,
          errorDetails: error
        });
        throw error;
      }

      console.log('🟢 SCENARIO COVERAGE - Successfully saved frequency-based results to database:', {
        recordsInserted: data?.length || 0,
        data: data
      });
    } catch (err) {
      console.error('🔴 SCENARIO COVERAGE - Unexpected error saving results:', {
        error: err,
        stack: err instanceof Error ? err.stack : 'No stack trace',
        records: records
      });
      throw err;
    }
  }


  /**
   * Handle item added event
   */
  public async onItemAdded(
    userId: string,
    items: WardrobeItem[],
    scenarios: Scenario[],
    newItem: WardrobeItem,
    season: Season
  ): Promise<void> {
    console.log('🟦 SCENARIO COVERAGE - Handling item added:', newItem.name);
    // Update scenario coverage using frequency-based system
    await this.updateScenarioCoverage(userId, items, scenarios, season);
  }

  /**
   * Handle item updated event
   */
  public async onItemUpdated(
    userId: string,
    items: WardrobeItem[],
    scenarios: Scenario[],
    oldItem: WardrobeItem,
    newItem: WardrobeItem,
    season: Season
  ): Promise<void> {
    console.log('🟦 SCENARIO COVERAGE - Handling item updated:', newItem.name);
    // Update scenario coverage using frequency-based system
    await this.updateScenarioCoverage(userId, items, scenarios, season);
  }

  /**
   * Handle item deleted event
   */
  public async onItemDeleted(
    userId: string,
    items: WardrobeItem[],
    scenarios: Scenario[],
    deletedItem: WardrobeItem,
    season: Season
  ): Promise<void> {
    console.log('🟦 SCENARIO COVERAGE - Handling item deleted:', deletedItem.name);
    // Update scenario coverage using frequency-based system
    await this.updateScenarioCoverage(userId, items, scenarios, season);
  }
}
