/**
 * Utility functions for processing style preferences data for Claude prompts
 */

/**
 * Processes user style preferences data into a formatted prompt section
 * @param {Object} userPreferences - The user's style preferences data
 * @returns {string} Formatted style preferences section for Claude prompt
 */
function formatStylePreferencesForPrompt(userPreferences) {
  if (!userPreferences) {
    return '';
  }

  let preferencesPrompt = "\n\nImportant - Consider the user's style preferences:\n";
  
  // Handle preferred styles (from Supabase this is an array)
  if (userPreferences.preferredStyles && userPreferences.preferredStyles.length > 0) {
    preferencesPrompt += "- Preferred styles: " + userPreferences.preferredStyles.join(", ") + "\n";
  }
  
  // Handle slider values for style preferences
  if (userPreferences.stylePreferences) {
    const { comfortVsStyle, basicsVsStatements } = userPreferences.stylePreferences;
    
    if (typeof comfortVsStyle === 'number') {
      // Convert 0-100 scale to text description
      let comfortStyleDesc = "Balanced";
      if (comfortVsStyle > 70) comfortStyleDesc = "Strongly prefers comfort over style";
      else if (comfortVsStyle > 55) comfortStyleDesc = "Slightly prefers comfort over style";
      else if (comfortVsStyle < 30) comfortStyleDesc = "Strongly prefers style over comfort";
      else if (comfortVsStyle < 45) comfortStyleDesc = "Slightly prefers style over comfort";
      
      preferencesPrompt += "- Comfort vs Style: " + comfortStyleDesc + " (" + comfortVsStyle + "/100)\n";
    }
    
    if (typeof basicsVsStatements === 'number') {
      // Convert 0-100 scale to text description
      let basicsStatementsDesc = "Balanced mix";
      if (basicsVsStatements > 70) basicsStatementsDesc = "Strongly prefers basics over statement pieces";
      else if (basicsVsStatements > 55) basicsStatementsDesc = "Slightly prefers basics over statement pieces";
      else if (basicsVsStatements < 30) basicsStatementsDesc = "Strongly prefers statement pieces over basics";
      else if (basicsVsStatements < 45) basicsStatementsDesc = "Slightly prefers statement pieces over basics";
      
      preferencesPrompt += "- Basics vs Statement Pieces: " + basicsStatementsDesc + " (" + basicsVsStatements + "/100)\n";
    }
    
    // Include additional notes if available
    if (userPreferences.stylePreferences.additionalNotes) {
      preferencesPrompt += "- Additional style notes: " + userPreferences.stylePreferences.additionalNotes + "\n";
    }
  }

  return preferencesPrompt;
}

module.exports = {
  formatStylePreferencesForPrompt
};
