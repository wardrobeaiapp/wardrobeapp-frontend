// Types for the optimized AI analysis mocks database structure

export interface AIAnalysisMockRecord {
  id?: string;
  wardrobe_item_id: string;
  
  // Separate columns for frequently accessed fields
  compatibility_score: number;
  suitable_scenarios: string[];
  item_subcategory: string;
  recommendation_action: string;
  recommendation_text: string;
  wishlist_status: 'approved' | 'potential_issue' | 'not_reviewed';
  has_compatible_items: boolean;
  outfit_combinations_count: number;
  analysis_error?: string | null;
  analysis_error_details?: string | null;
  
  // Complex nested data (kept in JSON for flexibility)
  analysis_data: AIAnalysisComplexData;
  
  // Metadata
  created_from_real_analysis: boolean;
  created_by: string;
  created_at?: string;
  updated_at: string;
}

export interface AIAnalysisComplexData {
  compatibleItems: { [category: string]: any[] };
  outfitCombinations: any[];
  seasonScenarioCombinations: any[];
  coverageGapsWithNoOutfits: any[];
  extractedTags: any | null;
  analysisResult: string;
}

// Utility type for creating new mock records
export type CreateAIMockRecord = Omit<AIAnalysisMockRecord, 'id' | 'created_at'>;

// Utility type for mock data query filters
export interface AIMockQueryFilters {
  compatibility_score?: {
    min?: number;
    max?: number;
  };
  suitable_scenarios?: string[];
  has_compatible_items?: boolean;
  outfit_combinations_count?: {
    min?: number;
    max?: number;
  };
  wishlist_status?: AIAnalysisMockRecord['wishlist_status'];
  item_subcategory?: string;
}

// Helper functions for working with mock data
export const mockDataHelpers = {
  /**
   * Extract commonly accessed fields from mock data for database storage
   */
  extractOptimizedFields: (mockData: any) => {
    const compatibilityScore = mockData.compatibility?.score || 0;
    const suitableScenarios = mockData.compatibility?.reasons || mockData.suitableScenarios || [];
    const hasCompatibleItems = mockData.compatibleItems && Object.keys(mockData.compatibleItems).length > 0;
    const outfitCombinationsCount = Array.isArray(mockData.outfitCombinations) ? mockData.outfitCombinations.length : 0;
    
    const optimizedAnalysisData: AIAnalysisComplexData = {
      compatibleItems: mockData.compatibleItems || {},
      outfitCombinations: mockData.outfitCombinations || [],
      seasonScenarioCombinations: mockData.seasonScenarioCombinations || [],
      coverageGapsWithNoOutfits: mockData.coverageGapsWithNoOutfits || [],
      extractedTags: mockData.extractedTags || null,
      analysisResult: mockData.analysisResult || ''
    };
    
    return {
      compatibility_score: compatibilityScore,
      suitable_scenarios: suitableScenarios,
      item_subcategory: mockData.itemSubcategory || '',
      recommendation_action: mockData.recommendationAction || '',
      recommendation_text: mockData.recommendationText || '',
      wishlist_status: mockData.status || 'not_reviewed' as const,
      has_compatible_items: hasCompatibleItems,
      outfit_combinations_count: outfitCombinationsCount,
      analysis_error: mockData.error || null,
      analysis_error_details: mockData.errorDetails || null,
      analysis_data: optimizedAnalysisData
    };
  },

  /**
   * Reconstruct original mock data format from optimized database record
   */
  reconstructMockData: (record: AIAnalysisMockRecord) => {
    return {
      compatibility: {
        score: record.compatibility_score,
        reasons: record.suitable_scenarios
      },
      ...record.analysis_data,
      itemSubcategory: record.item_subcategory,
      recommendationAction: record.recommendation_action,
      recommendationText: record.recommendation_text,
      status: record.wishlist_status,
      error: record.analysis_error,
      errorDetails: record.analysis_error_details
    };
  }
};
