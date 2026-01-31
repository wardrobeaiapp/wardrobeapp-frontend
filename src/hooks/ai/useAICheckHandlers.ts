import { ChangeEvent } from 'react';
import { supabase } from '../../services/core';
import { mockDataHelpers } from '../../types/aiAnalysisMocks';
import type { WardrobeItem } from '../../types';

interface UseAICheckHandlersProps {
  // From useAICheck hook
  imageLink: string;
  uploadedFile: File | null;
  handleCheckItemRaw: (data?: any, wishlistItem?: WardrobeItem) => Promise<any>;
  handleFileUploadRaw: (file: File) => void;
  
  // From modal hook
  selectedWishlistItem: WardrobeItem | null;
  setIsAICheckModalOpen: (open: boolean) => void;
  clearSelectedWishlistItem: () => void;
  handleOpenCheckResultModal: () => void;
}

interface UseAICheckHandlersReturn {
  handleCheckItem: () => Promise<void>;
  handleApplyAICheck: (data: { category: string; subcategory: string; seasons: string[] }) => Promise<void>;
  handleFileUpload: (event: ChangeEvent<HTMLInputElement>) => void;
  handleSaveMock: (mockData: any) => Promise<void>;
}

export const useAICheckHandlers = ({
  imageLink,
  uploadedFile,
  handleCheckItemRaw,
  handleFileUploadRaw,
  selectedWishlistItem,
  setIsAICheckModalOpen,
  clearSelectedWishlistItem,
  handleOpenCheckResultModal
}: UseAICheckHandlersProps): UseAICheckHandlersReturn => {

  // Main AI Check handler
  const handleCheckItem = async () => {
    // If we have a selected wishlist item, skip the modal and use the item's data directly
    if (selectedWishlistItem && (imageLink || uploadedFile)) {
      console.log('Processing wishlist item with pre-filled data:', selectedWishlistItem);
      
      // Store the wishlist item reference to preserve it through the analysis
      const wishlistItemRef = selectedWishlistItem;
      
      // Create form data from the wishlist item
      const formData = {
        category: wishlistItemRef.category as string,
        subcategory: wishlistItemRef.subcategory || '',
        seasons: (wishlistItemRef.season || []).map(s => s as string)
      };
      
      console.log('Bypassing AI Check Settings modal for wishlist item. Using data:', formData);
      
      // Call the AI check directly with the wishlist item data
      const result = await handleCheckItemRaw(formData, wishlistItemRef);
      if (result) {
        // Note: selectedWishlistItem is managed by the modal hook and should already be set
        // Open the result modal if analysis was successful
        handleOpenCheckResultModal();
      }
    } else if (imageLink || uploadedFile) {
      // For regular uploads/URLs, show the settings modal
      setIsAICheckModalOpen(true);
    } else {
      // No image provided
      const result = await handleCheckItemRaw();
      if (result) {
        // Open the result modal if analysis was successful
        handleOpenCheckResultModal();
      }
    }
  };

  // Apply AI Check with form data
  const handleApplyAICheck = async (data: { category: string; subcategory: string; seasons: string[] }) => {
    setIsAICheckModalOpen(false);
    // Clear selected wishlist item since we're using manual form data
    clearSelectedWishlistItem();
    // Pass the form data to the AI check function
    const result = await handleCheckItemRaw(data);
    if (result) {
      // Open the result modal if analysis was successful
      handleOpenCheckResultModal();
    }
  };

  // Wrap file upload handler to handle ChangeEvent
  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      handleFileUploadRaw(event.target.files[0]);
      // Clear selected wishlist item when user uploads a new file
      clearSelectedWishlistItem();
    }
  };

  // Handler for saving analysis result as mock data
  const handleSaveMock = async (mockData: any) => {
    if (!selectedWishlistItem) {
      console.error('Cannot save mock: no wardrobe item selected');
      throw new Error('No wardrobe item selected');
    }

    try {
      // Get authenticated user from Supabase
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      console.log('💾 Saving analysis as mock for item:', selectedWishlistItem.id, 'user:', user.id);
      
      // Extract optimized fields using helper function
      const optimizedFields = mockDataHelpers.extractOptimizedFields(mockData);
      
      // Save with optimized structure to Supabase
      const { data, error } = await supabase
        .from('ai_analysis_mocks')
        .upsert({
          wardrobe_item_id: selectedWishlistItem.id,
          ...optimizedFields,
          // Metadata
          created_from_real_analysis: true,
          created_by: user.id,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'wardrobe_item_id'
        });

      if (error) {
        console.error('Supabase error saving mock:', error);
        throw new Error(error.message || 'Failed to save mock data');
      }

      console.log('✅ Mock data saved successfully via Supabase:', data);
    } catch (error) {
      console.error('Error saving mock data:', error);
      throw error; // Re-throw to trigger error state in modal
    }
  };

  return {
    handleCheckItem,
    handleApplyAICheck,
    handleFileUpload,
    handleSaveMock
  };
};
