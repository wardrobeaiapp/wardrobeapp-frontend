// Trigger system for recalculating scenario coverage when wardrobe changes

const { recalculateScenarioCoverage } = require('./scenarioCoverageCalculator');

/**
 * Trigger recalculation when a wardrobe item is added
 */
async function onItemAdded(userId, newItem) {
  console.log(`Item added trigger for user ${userId}:`, newItem.name);
  
  try {
    // Determine affected seasons and scenarios
    const affectedSeasons = newItem.season && newItem.season.length > 0 ? 
      newItem.season : ['spring', 'summer', 'fall', 'winter'];
    
    const affectedScenarios = newItem.scenarios && newItem.scenarios.length > 0 ?
      newItem.scenarios : null; // null = recalculate all scenarios
    
    console.log(`Recalculating for seasons: ${affectedSeasons.join(', ')}`);
    if (affectedScenarios) {
      console.log(`Recalculating for scenarios: ${affectedScenarios.join(', ')}`);
    }
    
    await recalculateScenarioCoverage(userId, affectedSeasons, affectedScenarios);
    
    console.log('Scenario coverage updated successfully after item addition');
  } catch (error) {
    console.error('Error updating scenario coverage after item addition:', error);
    // Don't throw - item addition should succeed even if coverage calculation fails
  }
}

/**
 * Trigger recalculation when a wardrobe item is updated
 */
async function onItemUpdated(userId, oldItem, newItem) {
  console.log(`Item updated trigger for user ${userId}:`, newItem.name);
  
  try {
    // Determine if changes affect scenario coverage
    const needsRecalculation = itemChangesAffectCoverage(oldItem, newItem);
    
    if (!needsRecalculation) {
      console.log('Item changes do not affect scenario coverage - skipping recalculation');
      return;
    }
    
    // Get all affected seasons (old + new)
    const oldSeasons = oldItem.season || [];
    const newSeasons = newItem.season || [];
    const affectedSeasons = [...new Set([...oldSeasons, ...newSeasons])];
    
    // Get all affected scenarios (old + new)
    const oldScenarios = oldItem.scenarios || [];
    const newScenarios = newItem.scenarios || [];
    const affectedScenarios = [...new Set([...oldScenarios, ...newScenarios])];
    
    console.log(`Recalculating for seasons: ${affectedSeasons.join(', ')}`);
    console.log(`Recalculating for scenarios: ${affectedScenarios.join(', ')}`);
    
    const scenariosParam = affectedScenarios.length > 0 ? affectedScenarios : null;
    await recalculateScenarioCoverage(userId, affectedSeasons, scenariosParam);
    
    console.log('Scenario coverage updated successfully after item update');
  } catch (error) {
    console.error('Error updating scenario coverage after item update:', error);
    // Don't throw - item update should succeed even if coverage calculation fails
  }
}

/**
 * Trigger recalculation when a wardrobe item is deleted
 */
async function onItemDeleted(userId, deletedItem) {
  console.log(`Item deleted trigger for user ${userId}:`, deletedItem.name);
  
  try {
    // Recalculate for seasons and scenarios the deleted item affected
    const affectedSeasons = deletedItem.season && deletedItem.season.length > 0 ? 
      deletedItem.season : ['spring', 'summer', 'fall', 'winter'];
    
    const affectedScenarios = deletedItem.scenarios && deletedItem.scenarios.length > 0 ?
      deletedItem.scenarios : null; // null = recalculate all scenarios
    
    console.log(`Recalculating for seasons: ${affectedSeasons.join(', ')}`);
    if (affectedScenarios) {
      console.log(`Recalculating for scenarios: ${affectedScenarios.join(', ')}`);
    }
    
    await recalculateScenarioCoverage(userId, affectedSeasons, affectedScenarios);
    
    console.log('Scenario coverage updated successfully after item deletion');
  } catch (error) {
    console.error('Error updating scenario coverage after item deletion:', error);
    // Don't throw - item deletion should succeed even if coverage calculation fails
  }
}

/**
 * Trigger full recalculation when user scenarios change
 */
async function onScenariosUpdated(userId) {
  console.log(`Scenarios updated trigger for user ${userId}`);
  
  try {
    // Recalculate everything when scenarios change
    await recalculateScenarioCoverage(userId);
    
    console.log('Full scenario coverage recalculation completed');
  } catch (error) {
    console.error('Error in full scenario coverage recalculation:', error);
    throw error; // Scenario updates should fail if coverage calculation fails
  }
}

/**
 * Determine if item changes affect scenario coverage calculation
 */
function itemChangesAffectCoverage(oldItem, newItem) {
  // Check if any coverage-affecting properties changed
  const coverageProperties = [
    'category',
    'subcategory', 
    'season',
    'scenarios',
    'style'
  ];
  
  for (const prop of coverageProperties) {
    const oldValue = JSON.stringify(oldItem[prop] || null);
    const newValue = JSON.stringify(newItem[prop] || null);
    
    if (oldValue !== newValue) {
      console.log(`Coverage-affecting property changed: ${prop}`);
      console.log(`Old: ${oldValue}, New: ${newValue}`);
      return true;
    }
  }
  
  return false;
}

/**
 * Bulk recalculation for maintenance/migration purposes
 */
async function recalculateAllUsers() {
  console.log('Starting bulk recalculation for all users');
  
  try {
    // TODO: Get all user IDs from database
    const userIds = await getAllUserIds();
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const userId of userIds) {
      try {
        await recalculateScenarioCoverage(userId);
        successCount++;
        console.log(`✅ Completed user ${userId} (${successCount}/${userIds.length})`);
      } catch (error) {
        errorCount++;
        console.error(`❌ Failed user ${userId}:`, error.message);
      }
    }
    
    console.log(`Bulk recalculation complete: ${successCount} success, ${errorCount} errors`);
    return { successCount, errorCount };
    
  } catch (error) {
    console.error('Error in bulk recalculation:', error);
    throw error;
  }
}

// Database helper function
async function getAllUserIds() {
  // TODO: Implement database query to get all user IDs
  throw new Error('getAllUserIds not implemented');
}

module.exports = {
  onItemAdded,
  onItemUpdated, 
  onItemDeleted,
  onScenariosUpdated,
  recalculateAllUsers,
  itemChangesAffectCoverage
};
