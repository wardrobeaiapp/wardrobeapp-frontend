/**
 * Claude-Based Outfit Generation Utility
 * 
 * Refactored modular version - imports functionality from separate modules
 * for better maintainability and single responsibility principle.
 */

// Import modular components
const { 
  generateOutfitsWithClaude, 
  buildOutfitCreationPrompt, 
  parseClaudeOutfitResponse 
} = require('./claudeOutfits');

// Export the functions from the modular structure for backward compatibility
module.exports = {
  generateOutfitsWithClaude,
  buildOutfitCreationPrompt,
  parseClaudeOutfitResponse
};
