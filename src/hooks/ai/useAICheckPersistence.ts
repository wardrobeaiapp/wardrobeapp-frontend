import { aiCheckHistoryService } from '../../services/ai/aiCheckHistoryService';
import { updateWardrobeItem } from '../../services/wardrobe/items';
import { WishlistStatus, WardrobeItem } from '../../types';

interface AnalysisData {
  analysis: string;
  score: number;
  feedback: string;
  recommendationText: string;
  suitableScenarios: string[];
  compatibleItems: { [category: string]: any[] };
  outfitCombinations: any[];
  seasonScenarioCombinations: any[];
  coverageGapsWithNoOutfits: any[];
  error?: string;
  details?: any;
}

export const useAICheckPersistence = () => {
  
  // Save AI Check results to history and update wardrobe item
  const saveAnalysisResults = async (
    analysisResult: string,
    score: number,
    status: WishlistStatus,
    response: any,
    imageLink: string,
    preFilledData: WardrobeItem
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('Saving AI Check analysis to history...');
      
      // Create the analysis data object
      const analysisData: AnalysisData = {
        analysis: analysisResult,
        score: score,
        feedback: response.feedback || analysisResult,
        recommendationText: response.recommendationText,
        suitableScenarios: response.suitableScenarios || [],
        compatibleItems: response.compatibleItems || {},
        outfitCombinations: response.outfitCombinations || [],
        seasonScenarioCombinations: response.seasonScenarioCombinations || [],
        coverageGapsWithNoOutfits: response.coverageGapsWithNoOutfits || [],
        error: undefined,
        details: undefined
      };

      // Create item data with current image and AI-computed wishlist status
      const itemData = {
        ...preFilledData,
        // For existing wardrobe items, preserve their original imageUrl
        // For new items, use the AI analysis imageLink
        imageUrl: preFilledData.imageUrl || imageLink,
        wishlistStatus: status // Update with AI recommendation status
      };

      // Save to history only for existing wardrobe items (don't block on this)
      if (preFilledData.id) {
        console.log('💾 Saving AI Check analysis to history (existing wardrobe item)');
        const historyResult = await aiCheckHistoryService.saveAnalysisToHistory(analysisData, itemData);
        
        if (historyResult.success) {
          console.log('AI Check analysis saved to history successfully');
        } else {
          console.warn('Failed to save AI Check analysis to history:', historyResult.error);
        }
      } else {
        console.log('⏭️ Skipping AI history save (new item - will be handled by backend)');
      }

      // Update wardrobe item's wishlist status if it's a wishlist item
      console.log('Checking wardrobe item update conditions:', {
        hasWishlist: !!preFilledData.wishlist,
        hasId: !!preFilledData.id,
        wishlistValue: preFilledData.wishlist,
        itemId: preFilledData.id,
        willUpdate: !!(preFilledData.wishlist && preFilledData.id)
      });
      
      if (preFilledData.wishlist && preFilledData.id) {
        try {
          console.log('Updating wardrobe item wishlist status:', {
            itemId: preFilledData.id,
            oldStatus: preFilledData.wishlistStatus,
            newStatus: status
          });
          
          const updatedItem = await updateWardrobeItem(preFilledData.id, {
            wishlistStatus: status
          });
          
          if (updatedItem) {
            console.log('Wardrobe item wishlist status updated successfully');
          } else {
            console.warn('Failed to update wardrobe item wishlist status');
          }
        } catch (updateError) {
          console.error('Error updating wardrobe item wishlist status:', updateError);
          // Don't fail the main analysis if wardrobe item update fails
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Error in saveAnalysisResults:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  };

  return {
    saveAnalysisResults
  };
};
