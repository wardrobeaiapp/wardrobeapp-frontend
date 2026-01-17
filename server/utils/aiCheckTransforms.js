/**
 * Transform WardrobeItemAnalysis data to database format
 */
function transformAnalysisForDatabase(analysisData, itemData) {
  const now = new Date().toISOString();
  
  // Generate title using item name
  const title = `AI Check: ${itemData.name}`;
  
  // Create description from core analysis
  const description = analysisData.feedback || 'AI analysis completed';
  
  // Create summary from score and key findings
  let summary = `Score: ${analysisData.score}/10`;
  if (analysisData.suitableScenarios && analysisData.suitableScenarios.length > 0) {
    summary += ` | Suitable for: ${analysisData.suitableScenarios.slice(0, 2).join(', ')}`;
    if (analysisData.suitableScenarios.length > 2) {
      summary += ` and ${analysisData.suitableScenarios.length - 2} more`;
    }
  }
  
  return {
    // Base fields
    title,
    description,
    summary,
    analysis_date: now,
    status: itemData.wishlistStatus || null,
    user_action_status: 'pending', // Default to pending
    
    // Core analysis results
    score: analysisData.score,
    feedback: analysisData.feedback || '',
    recommendation_text: analysisData.recommendationText || null,
    
    // Item details
    item_id: itemData.id,
    item_name: itemData.name,
    item_category: itemData.category,
    item_subcategory: itemData.subcategory || null,
    item_image_url: itemData.imageUrl || null,
    item_wishlist_status: itemData.wishlistStatus || null,
    
    // Analysis data (stored as JSON)
    suitable_scenarios: JSON.stringify(analysisData.suitableScenarios || []),
    compatible_items: JSON.stringify(analysisData.compatibleItems || {}),
    outfit_combinations: JSON.stringify(analysisData.outfitCombinations || []),
    season_scenario_combinations: JSON.stringify(analysisData.seasonScenarioCombinations || []),
    coverage_gaps_with_no_outfits: JSON.stringify(analysisData.coverageGapsWithNoOutfits || []),
    
    // Raw analysis data
    raw_analysis: analysisData.analysis || null,
    analysis_metadata: JSON.stringify({
      analysisVersion: '1.0',
      aiModel: 'claude-3',
      processingTimeMs: analysisData.processingTimeMs || null,
      tokensUsed: analysisData.tokensUsed || null
    }),
    
    // Legacy support
    items_checked: 1,
    legacy_analysis_results: JSON.stringify({
      recommendations: analysisData.recommendationText ? [analysisData.recommendationText] : [],
      issues: [],
      suggestions: analysisData.suitableScenarios || []
    })
  };
}

/**
 * Transform database record to frontend format
 */
function transformDatabaseToFrontend(dbRecord) {
  return {
    id: dbRecord.id,
    type: 'check',
    title: dbRecord.title,
    description: dbRecord.description,
    summary: dbRecord.summary,
    score: dbRecord.score,
    feedback: dbRecord.feedback,
    recommendationText: dbRecord.recommendation_text,
    analysisDate: dbRecord.analysis_date,
    status: dbRecord.status,
    userActionStatus: dbRecord.user_action_status,
    
    // Item details
    itemDetails: {
      id: dbRecord.item_id,
      name: dbRecord.item_name,
      category: dbRecord.item_category,
      subcategory: dbRecord.item_subcategory,
      imageUrl: dbRecord.item_image_url,
      wishlistStatus: dbRecord.item_wishlist_status
    },
    
    // Parse JSON fields
    suitableScenarios: safeJsonParse(dbRecord.suitable_scenarios, []),
    compatibleItems: safeJsonParse(dbRecord.compatible_items, {}),
    outfitCombinations: safeJsonParse(dbRecord.outfit_combinations, []),
    seasonScenarioCombinations: safeJsonParse(dbRecord.season_scenario_combinations, []),
    coverageGapsWithNoOutfits: safeJsonParse(dbRecord.coverage_gaps_with_no_outfits, []),
    analysisMetadata: safeJsonParse(dbRecord.analysis_metadata, {}),
    
    // Legacy fields
    itemsChecked: dbRecord.items_checked,
    analysisResults: safeJsonParse(dbRecord.legacy_analysis_results, {
      recommendations: [],
      issues: [],
      suggestions: []
    }),
    
    // Raw data
    rawAnalysis: dbRecord.raw_analysis,
    createdAt: dbRecord.created_at,
    updatedAt: dbRecord.updated_at
  };
}

/**
 * Safe JSON parsing with fallback
 */
function safeJsonParse(jsonString, fallback = null) {
  if (!jsonString) return fallback;
  
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.warn('Failed to parse JSON:', error.message);
    return fallback;
  }
}

/**
 * Calculate history statistics from records
 */
function calculateHistoryStats(records) {
  if (!records || records.length === 0) {
    return {
      totalChecks: 0,
      averageScore: 0,
      pendingItems: 0,
      completedItems: 0
    };
  }

  const totalChecks = records.length;
  const scores = records.map(record => record.score || 0).filter(score => score > 0);
  const averageScore = scores.length > 0 
    ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length * 10) / 10
    : 0;
    
  const pendingItems = records.filter(record => 
    record.user_action_status === 'pending' || !record.user_action_status
  ).length;
  
  const completedItems = records.filter(record => 
    record.user_action_status === 'purchased' || record.user_action_status === 'dismissed'
  ).length;

  return {
    totalChecks,
    averageScore,
    pendingItems,
    completedItems
  };
}

module.exports = {
  transformAnalysisForDatabase,
  transformDatabaseToFrontend,
  calculateHistoryStats,
  safeJsonParse
};
