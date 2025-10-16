import { supabase } from '../core';
import type { 
  AIAnalysisMockRecord, 
  AIMockQueryFilters, 
  mockDataHelpers 
} from '../../types/aiAnalysisMocks';
import { mockDataHelpers as mockHelpers } from '../../types/aiAnalysisMocks';

/**
 * Service for querying and managing AI analysis mocks with optimized database structure
 */
export const aiAnalysisMocksService = {
  /**
   * Get mock analysis data with efficient queries using separate columns
   */
  async getMockAnalysis(wardrobeItemId: string): Promise<AIAnalysisMockRecord | null> {
    const { data, error } = await supabase
      .from('ai_analysis_mocks')
      .select('*')
      .eq('wardrobe_item_id', wardrobeItemId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No mock data found
      }
      throw new Error(`Failed to fetch mock analysis: ${error.message}`);
    }

    return data as unknown as AIAnalysisMockRecord;
  },

  /**
   * Query mocks with filters using indexed columns for better performance
   */
  async queryMocks(filters: AIMockQueryFilters): Promise<AIAnalysisMockRecord[]> {
    let query = supabase.from('ai_analysis_mocks').select('*');

    // Use indexed columns for efficient filtering
    if (filters.compatibility_score) {
      if (filters.compatibility_score.min !== undefined) {
        query = query.gte('compatibility_score', filters.compatibility_score.min);
      }
      if (filters.compatibility_score.max !== undefined) {
        query = query.lte('compatibility_score', filters.compatibility_score.max);
      }
    }

    if (filters.suitable_scenarios) {
      query = query.contains('suitable_scenarios', filters.suitable_scenarios);
    }

    if (filters.has_compatible_items !== undefined) {
      query = query.eq('has_compatible_items', filters.has_compatible_items);
    }

    if (filters.outfit_combinations_count) {
      if (filters.outfit_combinations_count.min !== undefined) {
        query = query.gte('outfit_combinations_count', filters.outfit_combinations_count.min);
      }
      if (filters.outfit_combinations_count.max !== undefined) {
        query = query.lte('outfit_combinations_count', filters.outfit_combinations_count.max);
      }
    }

    if (filters.wishlist_status) {
      query = query.eq('wishlist_status', filters.wishlist_status);
    }

    if (filters.item_subcategory) {
      query = query.eq('item_subcategory', filters.item_subcategory);
    }

    const { data, error } = await query.order('updated_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to query mocks: ${error.message}`);
    }

    return (data as unknown as AIAnalysisMockRecord[]) || [];
  },

  /**
   * Get statistics about mock data performance
   */
  async getMockStatistics(): Promise<{
    totalMocks: number;
    averageCompatibilityScore: number;
    itemsWithCompatiblePieces: number;
    averageOutfitCombinations: number;
    topSubcategories: { subcategory: string; count: number }[];
    topScenarios: { scenario: string; count: number }[];
  }> {
    // Get basic counts and averages
    const { data: rawStats, error: statsError } = await supabase
      .from('ai_analysis_mocks')
      .select('compatibility_score, has_compatible_items, outfit_combinations_count, item_subcategory, suitable_scenarios');

    if (statsError) {
      throw new Error(`Failed to get statistics: ${statsError.message}`);
    }

    if (!rawStats || rawStats.length === 0) {
      return {
        totalMocks: 0,
        averageCompatibilityScore: 0,
        itemsWithCompatiblePieces: 0,
        averageOutfitCombinations: 0,
        topSubcategories: [],
        topScenarios: []
      };
    }

    // Type assert the data
    const stats = rawStats as Array<{
      compatibility_score: number;
      has_compatible_items: boolean;
      outfit_combinations_count: number;
      item_subcategory: string;
      suitable_scenarios: string[];
    }>;

    const totalMocks = stats.length;
    const averageCompatibilityScore = stats.reduce((sum, item) => sum + (Number(item.compatibility_score) || 0), 0) / totalMocks;
    const itemsWithCompatiblePieces = stats.filter(item => Boolean(item.has_compatible_items)).length;
    const averageOutfitCombinations = stats.reduce((sum, item) => sum + (Number(item.outfit_combinations_count) || 0), 0) / totalMocks;

    // Count subcategories
    const subcategoryCounts: { [key: string]: number } = {};
    stats.forEach(item => {
      const subcategory = String(item.item_subcategory || '');
      if (subcategory) {
        subcategoryCounts[subcategory] = (subcategoryCounts[subcategory] || 0) + 1;
      }
    });

    // Count scenarios
    const scenarioCounts: { [key: string]: number } = {};
    stats.forEach(item => {
      const scenarios = item.suitable_scenarios;
      if (scenarios && Array.isArray(scenarios)) {
        scenarios.forEach((scenario: string) => {
          const scenarioStr = String(scenario);
          scenarioCounts[scenarioStr] = (scenarioCounts[scenarioStr] || 0) + 1;
        });
      }
    });

    const topSubcategories = Object.entries(subcategoryCounts)
      .map(([subcategory, count]) => ({ subcategory, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const topScenarios = Object.entries(scenarioCounts)
      .map(([scenario, count]) => ({ scenario, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalMocks,
      averageCompatibilityScore: Math.round(averageCompatibilityScore * 100) / 100,
      itemsWithCompatiblePieces,
      averageOutfitCombinations: Math.round(averageOutfitCombinations * 100) / 100,
      topSubcategories,
      topScenarios
    };
  },

  /**
   * Reconstruct original mock data format for backward compatibility
   */
  reconstructMockData(record: AIAnalysisMockRecord) {
    return mockHelpers.reconstructMockData(record);
  },

  /**
   * Delete mock data
   */
  async deleteMock(wardrobeItemId: string): Promise<void> {
    const { error } = await supabase
      .from('ai_analysis_mocks')
      .delete()
      .eq('wardrobe_item_id', wardrobeItemId);

    if (error) {
      throw new Error(`Failed to delete mock: ${error.message}`);
    }
  }
};
