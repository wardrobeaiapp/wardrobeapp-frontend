import { outfitService } from './outfitService';
import { styleAdviceService } from './styleAdviceService';
import { wardrobeAnalysisService } from './wardrobeAnalysisService';

// Re-export services for backward compatibility
export const claudeService = {
  // Outfit suggestions functionality
  getOutfitSuggestions: outfitService.getOutfitSuggestions,
  
  // Style advice functionality
  getStyleAdvice: styleAdviceService.getStyleAdvice,
  
  // Wardrobe analysis functionality
  analyzeWardrobeItem: wardrobeAnalysisService.analyzeWardrobeItem
};
