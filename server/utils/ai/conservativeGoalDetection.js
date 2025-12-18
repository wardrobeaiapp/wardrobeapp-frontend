/**
 * Utility for detecting conservative/minimalist user goals
 * Shared between prompt generation and direct scoring
 */

const conservativeGoalIds = [
  'optimize-my-wardrobe',     
  'buy-less-shop-more-intentionally',
  'declutter-downsize', 
  'save-money'
];

/**
 * Check if user has conservative/minimalist goals
 * @param {Array} userGoals - Array of user goal strings
 * @returns {boolean} - True if user has conservative goals
 */
function hasConservativeGoals(userGoals = []) {
  if (!userGoals || !Array.isArray(userGoals)) {
    return false;
  }

  return userGoals.some(goal => 
    conservativeGoalIds.includes(goal.toLowerCase()) ||
    goal.toLowerCase().includes('optimize') ||
    goal.toLowerCase().includes('minimalist') ||
    goal.toLowerCase().includes('buy less') ||
    goal.toLowerCase().includes('declutter')
  );
}

/**
 * Log conservative goal detection results
 * @param {Array} userGoals - Array of user goal strings
 * @param {boolean} isConservative - Result of hasConservativeGoals check
 */
function logConservativeGoalDetection(userGoals, isConservative) {
  console.log(`🎯 User Goals Check:`, userGoals);
  console.log(`🎯 Conservative Goals Detected:`, isConservative);
}

module.exports = {
  conservativeGoalIds,
  hasConservativeGoals,
  logConservativeGoalDetection
};
