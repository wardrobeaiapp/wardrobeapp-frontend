/**
 * Generate item name from color and subcategory (same format as outfit combinations)
 */
function generateItemName(itemData) {
  if (itemData?.name) {
    return itemData.name;
  }
  
  // For image-only analyses, generate name from color + subcategory
  const color = itemData?.color;
  const subcategory = itemData?.subcategory;
  
  if (color && subcategory) {
    return `${color} ${subcategory}`;
  } else if (subcategory) {
    return subcategory;
  } else if (color) {
    return `${color} Item`;
  } else {
    return 'Image Analysis';
  }
}

/**
 * Map frontend category values to database constraint values
 */
function mapCategoryToDbFormat(category) {
  const categoryMap = {
    'tops': 'top',
    'top': 'top',
    'bottoms': 'bottom', 
    'bottom': 'bottom',
    'dresses': 'one_piece',
    'one_piece': 'one_piece',
    'dress': 'one_piece',
    'outerwear': 'outerwear',
    'shoes': 'footwear',
    'footwear': 'footwear',
    'accessories': 'accessory',
    'accessory': 'accessory'
  };
  
  return categoryMap[category?.toLowerCase()] || 'other';
}

/**
 * Transform WardrobeItemAnalysis data to database format (EXACT SAME AS ANALYSIS-MOCKS + status fields)
 */
function transformAnalysisForDatabase(analysisData, itemData, userId) {
  // Build rich analysis_data object (EXACT same format as analysis-mocks)
  const analysis_data = {
    analysis: analysisData.analysis || analysisData.feedback || '',
    score: analysisData.score,
    feedback: analysisData.feedback || '',
    recommendationText: analysisData.recommendationText || null,
    suitableScenarios: analysisData.suitableScenarios || [],
    compatibleItems: analysisData.compatibleItems || {},
    outfitCombinations: analysisData.outfitCombinations || [],
    seasonScenarioCombinations: analysisData.seasonScenarioCombinations || [],
    coverageGapsWithNoOutfits: analysisData.coverageGapsWithNoOutfits || [],
    itemDetails: {
      id: itemData?.id || null, // Support null for image-only analyses
      name: generateItemName(itemData),
      category: mapCategoryToDbFormat(itemData?.category),
      subcategory: itemData?.subcategory || null,
      imageUrl: itemData?.imageUrl || null,
      wishlistStatus: itemData?.wishlistStatus || null
    }
  };
  
  // Return EXACT SAME format as analysis-mocks (all 17 columns) + 1 additional status field
  return {
    // Original 7 columns from analysis-mocks
    wardrobe_item_id: itemData?.id || null, // Use null for image-only analyses
    analysis_data: analysis_data, // Rich JSONB object (not stringified)
    created_from_real_analysis: true,
    created_by: userId,
    updated_at: new Date().toISOString(),
    image_url: itemData?.imageUrl || null, // Store image URL like wardrobe_items
    // created_at and id are handled by database defaults
    
    // Additional 10 columns from optimize migration (populate from analysisData)
    compatibility_score: Math.round(analysisData.score * 10) || 0, // Convert 0-10 to 0-100 
    suitable_scenarios: analysisData.suitableScenarios || [],
    item_subcategory: itemData?.subcategory || null,
    recommendation_action: analysisData.score >= 7 ? 'add_to_wardrobe' : 'consider_carefully',
    recommendation_text: analysisData.recommendationText || analysisData.feedback || null,
    wishlist_status: itemData.wishlistStatus || 'not_reviewed',
    has_compatible_items: Object.keys(analysisData.compatibleItems || {}).length > 0,
    outfit_combinations_count: (analysisData.outfitCombinations || []).length,
    analysis_error: null, // No error since we have successful analysis
    analysis_error_details: null,
    
    // ✅ ADDITIONAL STATUS FIELD (only difference from mocks)
    user_action_status: 'pending'
    // Note: wishlist_status already handled above in mocks columns
  };
}

/**
 * Transform database record to frontend format (simplified structure)
 */
function transformDatabaseToFrontend(dbRecord) {
  // analysis_data is already an object from Supabase JSONB field (no need to parse)
  const analysisData = dbRecord.analysis_data || {};

  // Build title and description from analysis_data
  const itemName = analysisData.itemDetails?.name || 'Unknown Item';
  const title = `AI Check: ${itemName}`;
  const description = analysisData.feedback || 'AI analysis completed';
  const summary = `Score: ${analysisData.score || 0}/10`;

  return {
    id: dbRecord.id,
    type: 'check',
    title,
    description,
    summary,
    date: new Date(dbRecord.created_at),
    status: dbRecord.wishlist_status,
    userActionStatus: dbRecord.user_action_status || 'pending', // Add fallback
    
    // Simplified structure matching new interface
    wardrobeItemId: dbRecord.wardrobe_item_id,
    analysisData: analysisData, // Rich analysis data (same as analysis_mocks)
    wishlistStatus: dbRecord.wishlist_status,
    createdAt: dbRecord.created_at,
    updatedAt: dbRecord.updated_at,
    
    // For backward compatibility - extract from analysisData
    score: analysisData.score,
    feedback: analysisData.feedback,
    recommendationText: analysisData.recommendationText,
    analysisDate: dbRecord.created_at,
    
    // Extract rich data for frontend consumption
    itemDetails: analysisData.itemDetails || {},
    suitableScenarios: analysisData.suitableScenarios || [],
    compatibleItems: analysisData.compatibleItems || {},
    outfitCombinations: analysisData.outfitCombinations || [],
    seasonScenarioCombinations: analysisData.seasonScenarioCombinations || [],
    coverageGapsWithNoOutfits: analysisData.coverageGapsWithNoOutfits || [],
    analysis: analysisData.analysis,
    
    // Legacy fields (extract from analysisData since old columns don't exist)
    itemsChecked: 1, // Default value
    analysisResults: {
      recommendations: analysisData.suitableScenarios || [],
      issues: [],
      suggestions: analysisData.suitableScenarios || []
    },
    
    // Raw data from analysisData
    rawAnalysis: analysisData.analysis,
    
    // Image for display from analysisData
    image: analysisData.itemDetails?.imageUrl || null,
    
    // Other fields from simplified structure
    userId: dbRecord.user_id || null
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
