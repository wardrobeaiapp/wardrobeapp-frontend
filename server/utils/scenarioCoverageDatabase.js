// Database helper functions for scenario coverage storage and retrieval

/**
 * Get user's wardrobe items from in-memory store
 * TODO: Replace with actual database query when migrating from in-memory storage
 */
async function getUserWardrobeItems(userId) {
  try {
    // For now, use the global in-memory store
    const userItems = global.inMemoryWardrobeItems.filter(item => item.userId === userId);
    console.log(`Retrieved ${userItems.length} wardrobe items for user ${userId}`);
    return userItems;
  } catch (error) {
    console.error('Error getting user wardrobe items:', error);
    return [];
  }
}

/**
 * Get user's scenarios from in-memory store
 * TODO: Replace with actual database query when scenarios are stored in database
 */
async function getUserScenarios(userId) {
  try {
    // For now, return default scenarios
    // TODO: Get from actual scenarios table when implemented
    const defaultScenarios = [
      { name: 'Office Work', frequency: 'daily' },
      { name: 'Weekend Casual', frequency: 'weekly' },
      { name: 'Date Night', frequency: 'monthly' },
      { name: 'Exercise', frequency: 'weekly' },
      { name: 'Travel', frequency: 'monthly' },
      { name: 'Special Events', frequency: 'rarely' }
    ];
    
    console.log(`Retrieved ${defaultScenarios.length} scenarios for user ${userId}`);
    return defaultScenarios;
  } catch (error) {
    console.error('Error getting user scenarios:', error);
    return [];
  }
}

/**
 * Store scenario coverage results in database
 * Uses upsert to handle updates to existing records
 */
async function storeScenarioCoverage(userId, coverageResults) {
  try {
    console.log(`Storing ${coverageResults.length} scenario coverage records for user ${userId}`);
    
    // TODO: Implement actual database storage
    // For now, store in a global in-memory object for testing
    if (!global.inMemoryScenarioCoverage) {
      global.inMemoryScenarioCoverage = [];
    }
    
    // Remove existing records for this user
    global.inMemoryScenarioCoverage = global.inMemoryScenarioCoverage.filter(
      record => record.userId !== userId
    );
    
    // Add new records
    global.inMemoryScenarioCoverage.push(...coverageResults);
    
    console.log(`Successfully stored scenario coverage for user ${userId}`);
    return true;
    
  } catch (error) {
    console.error('Error storing scenario coverage:', error);
    throw error;
  }
}

/**
 * Get stored scenario coverage for specific seasons
 */
async function getStoredScenarioCoverage(userId, seasons = null) {
  try {
    // TODO: Implement actual database query
    // For now, use in-memory storage
    if (!global.inMemoryScenarioCoverage) {
      return [];
    }
    
    let coverage = global.inMemoryScenarioCoverage.filter(
      record => record.userId === userId
    );
    
    // Filter by seasons if specified
    if (seasons && seasons.length > 0) {
      coverage = coverage.filter(record => seasons.includes(record.season));
    }
    
    console.log(`Retrieved ${coverage.length} scenario coverage records for user ${userId}`);
    
    // Convert to expected format
    return coverage.map(record => ({
      scenario_name: record.scenarioName,
      scenario_frequency: record.scenarioFrequency,
      season: record.season,
      total_outfits: record.totalOutfits,
      coverage_level: record.coverageLevel,
      bottleneck: record.bottleneck
    }));
    
  } catch (error) {
    console.error('Error getting stored scenario coverage:', error);
    return [];
  }
}

/**
 * Get all user IDs (for bulk operations)
 */
async function getAllUserIds() {
  try {
    // TODO: Implement actual database query
    // For now, get unique user IDs from in-memory wardrobe items
    const userIds = [...new Set(global.inMemoryWardrobeItems.map(item => item.userId))];
    console.log(`Found ${userIds.length} unique users`);
    return userIds;
  } catch (error) {
    console.error('Error getting all user IDs:', error);
    return [];
  }
}

/**
 * Initialize in-memory storage for testing
 */
function initializeInMemoryStorage() {
  if (!global.inMemoryScenarioCoverage) {
    global.inMemoryScenarioCoverage = [];
    console.log('Initialized in-memory scenario coverage storage');
  }
}

// Database operations using Supabase (for future implementation)
/**
 * TODO: Implement these functions when migrating to proper database storage
 */

/*
async function storeScenarioCoverageInDatabase(userId, coverageResults) {
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
  
  try {
    // Upsert scenario coverage records
    const { data, error } = await supabase
      .from('scenario_coverage')
      .upsert(
        coverageResults.map(result => ({
          user_id: userId,
          scenario_id: result.scenarioId,
          scenario_name: result.scenarioName,
          scenario_frequency: result.scenarioFrequency,
          season: result.season,
          total_outfits: result.totalOutfits,
          coverage_level: result.coverageLevel,
          outfit_breakdown: result.outfitBreakdown,
          bottleneck: result.bottleneck,
          missing_for_next_outfit: result.missingForNextOutfit,
          item_counts: result.itemCounts,
          last_updated: new Date().toISOString()
        })),
        { 
          onConflict: 'user_id,scenario_id,season',
          returning: 'minimal'
        }
      );
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error storing scenario coverage in database:', error);
    throw error;
  }
}

async function getScenarioCoverageFromDatabase(userId, seasons) {
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
  
  try {
    let query = supabase
      .from('scenario_coverage')
      .select('*')
      .eq('user_id', userId);
      
    if (seasons && seasons.length > 0) {
      query = query.in('season', seasons);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error getting scenario coverage from database:', error);
    return [];
  }
}
*/

// Initialize storage on module load
initializeInMemoryStorage();

module.exports = {
  getUserWardrobeItems,
  getUserScenarios,
  storeScenarioCoverage,
  getStoredScenarioCoverage,
  getAllUserIds,
  initializeInMemoryStorage
};
