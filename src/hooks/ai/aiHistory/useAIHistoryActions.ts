import { aiCheckHistoryService } from '../../../services/ai/aiCheckHistoryService';
import { supabase } from '../../../services/core/supabaseClient';
import { UserActionStatus } from '../../../types';
import { AIHistoryItem, AICheckHistoryItem } from '../../../types/ai';

export const useAIHistoryActions = (
  historyItems: AIHistoryItem[],
  setHistoryItems: (updater: (prev: AIHistoryItem[]) => AIHistoryItem[]) => void,
  setIsHistoryDetailModalOpen: (open: boolean) => void
) => {
  const handleMoveToWishlist = async (itemId: string) => {
    try {
      // Find the history item to determine if it's from wishlist or image-based
      const historyItem = historyItems.find(item => item.id === itemId);
      
      if (!historyItem) {
        throw new Error('History item not found');
      }

      // Check if this is a wishlist item (has wardrobeItemId and itemDetails)
      const isFromWishlistItem = (historyItem as any).wardrobeItemId && 
        (historyItem as any).richData?.itemDetails?.id;

      if (isFromWishlistItem) {
        // For wishlist items: Just update status to SAVED (current behavior)
        console.log('📝 [useAIHistory] Updating wishlist item status to saved');
        const result = await aiCheckHistoryService.updateRecordStatus(itemId, 'saved');

        if (!result.success) {
          throw new Error(result.error);
        }

        setHistoryItems((prev: AIHistoryItem[]) =>
          prev.map((item: AIHistoryItem) =>
            item.id === itemId
              ? { ...item, userActionStatus: UserActionStatus.SAVED }
              : item
          )
        );
        setIsHistoryDetailModalOpen(false);
      } else {
        // For image-based items: Navigate to wardrobe page and open Add Item modal
        console.log('🛍️ [useAIHistory] Navigating to wardrobe page to add image-based item');
        
        // Get image URL from history item
        const imageUrl = (historyItem as any).richData?.itemDetails?.imageUrl || 
                         (historyItem as any).image || 
                         (historyItem as any).richData?.image;
        
        if (!imageUrl) {
          throw new Error('No image URL found in history item');
        }

        // Get AI analysis data to pre-fill the form
        const richData = (historyItem as any).richData || {};
        const analysisData = {
          name: richData.itemDetails?.name,
          category: richData.itemDetails?.category,
          subcategory: richData.itemDetails?.subcategory,
          color: richData.itemDetails?.color,
          pattern: richData.itemDetails?.pattern,
          material: richData.itemDetails?.material,
          brand: richData.itemDetails?.brand,
          price: richData.itemDetails?.price,
          silhouette: richData.itemDetails?.silhouette,
          length: richData.itemDetails?.length,
          sleeves: richData.itemDetails?.sleeves,
          style: richData.itemDetails?.style,
          rise: richData.itemDetails?.rise,
          neckline: richData.itemDetails?.neckline,
          heelHeight: richData.itemDetails?.heelHeight,
          bootHeight: richData.itemDetails?.bootHeight,
          type: richData.itemDetails?.type,
          closure: richData.itemDetails?.closure,
          details: richData.itemDetails?.details,
          seasons: richData.itemDetails?.seasons || [],
          scenarios: richData.itemDetails?.scenarios || [],
          size: richData.itemDetails?.size,
          // Pre-fill image with correct field name for WardrobeItem interface
          imageUrl: imageUrl
        };

        // Store the data in sessionStorage for the wardrobe page to pick up
        sessionStorage.setItem('aiHistoryAddItem', JSON.stringify({
          fromAIHistory: true,
          historyItemId: itemId,
          itemData: analysisData
        }));

        // Navigate to wardrobe page
        window.location.href = '/';
        
        // Close the history modal
        setIsHistoryDetailModalOpen(false);
      }
    } catch (error: any) {
      console.error('Failed to handle move to wishlist:', error.message || error);
    }
  };

  const handleMarkAsPurchased = async (itemId: string) => {
    try {
      // First, get the history item to find the wardrobe item ID
      const historyItem = historyItems.find(item => item.id === itemId);
      
      // Only check items can be marked as purchased (not recommendations)
      if (!historyItem || historyItem.type !== 'check') {
        throw new Error('Only AI check items can be marked as purchased');
      }
      
      const checkItem = historyItem as AICheckHistoryItem;
      if (!checkItem.wardrobeItemId) {
        throw new Error('No wardrobe item found for this history record');
      }

      // Update the history status to 'applied'
      const result = await aiCheckHistoryService.updateRecordStatus(itemId, 'applied');
      if (!result.success) {
        throw new Error(result.error);
      }

      // Move the item from wishlist to wardrobe by making a direct API call
      let authToken = '';
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session?.access_token) {
          authToken = sessionData.session.access_token;
        }
      } catch (e) {}
      if (!authToken) {
        authToken = localStorage.getItem('token') || '';
      }

      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const updateResponse = await fetch(`${apiUrl}/api/wardrobe-items/${checkItem.wardrobeItemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': authToken
        },
        body: JSON.stringify({
          wishlist: false
        })
      });

      if (!updateResponse.ok) {
        console.warn('Failed to update wardrobe item wishlist status, but history was updated');
      }

      // Wait a moment for the database to process the update
      await new Promise(resolve => setTimeout(resolve, 500));

      // Update local state
      setHistoryItems((prev: AIHistoryItem[]) =>
        prev.map(item =>
          item.id === itemId
            ? { ...item, userActionStatus: UserActionStatus.APPLIED }
            : item
        )
      );

      // Trigger wardrobe refresh event
      window.dispatchEvent(
        new CustomEvent('wardrobe:changed', { 
          detail: { 
            type: 'updated', 
            id: checkItem.wardrobeItemId,
            movedFromWishlist: true
          } 
        })
      );

      setIsHistoryDetailModalOpen(false);
    } catch (error: any) {
      console.error('Failed to mark item as purchased:', error.message || error);
    }
  };

  const handleRemoveFromWishlist = async (itemId: string): Promise<boolean> => {
    try {
      const historyItem = historyItems.find(item => item.id === itemId);

      let wardrobeItemId = historyItem?.type === 'check' ? historyItem.wardrobeItemId : undefined;

      if (!wardrobeItemId) {
        const recordResult = await aiCheckHistoryService.getHistoryRecord(itemId);
        if (!recordResult.success || !recordResult.record) {
          throw new Error(recordResult.error || 'History item not found');
        }
        const recordAny = recordResult.record as any;
        wardrobeItemId = recordAny.wardrobe_item_id || recordAny.wardrobeItemId;
      }

      console.log('[AIHistory] Remove from wishlist: cleanup');

      const cleanupResult = await aiCheckHistoryService.cleanupRichData(itemId);
      if (!cleanupResult.success) {
        console.warn('⚠️ Failed to clean AI history data:', cleanupResult.error);
        throw new Error(`Failed to clean AI history data: ${cleanupResult.error}`);
      }

      if (wardrobeItemId) {
        console.log('[AIHistory] Remove from wishlist: delete wardrobe item');
        try {
          const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

          let authToken = '';
          try {
            const { data: sessionData } = await supabase.auth.getSession();
            if (sessionData?.session?.access_token) {
              authToken = sessionData.session.access_token;
            }
          } catch (e) {
          }
          if (!authToken) {
            authToken = localStorage.getItem('token') || '';
          }

          const response = await fetch(`${apiUrl}/api/wardrobe-items/${wardrobeItemId}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'x-auth-token': authToken
            }
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Failed to delete wardrobe item:', errorText);
            throw new Error(`Failed to delete wardrobe item: ${response.status} - ${errorText}`);
          }

          window.dispatchEvent(
            new CustomEvent('wardrobe:changed', { detail: { type: 'deleted', id: wardrobeItemId } })
          );
        } catch (error) {
          console.error('❌ Error deleting wardrobe item:', error);
          throw new Error(`Failed to delete wardrobe item: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      } else {
        throw new Error('No wardrobeItemId found on history item; cannot delete wardrobe item safely');
      }

      console.log('[AIHistory] Remove from wishlist: set dismissed status');
      const statusResult = await aiCheckHistoryService.updateRecordStatus(itemId, 'dismissed');
      if (!statusResult.success) {
        throw new Error(statusResult.error || 'Failed to set dismissed status');
      }

      setHistoryItems((prev: AIHistoryItem[]) => {
        if (!prev.some(item => item.id === itemId)) return prev;

        const updatedItems = prev.map(item =>
          item.id === itemId
            ? {
              ...item,
              userActionStatus: UserActionStatus.DISMISSED,
              ...(item.type === 'check' && item.richData ? {
                richData: {
                  ...item.richData,
                  compatibleItems: {},
                  outfitCombinations: [],
                  itemDetails: item.richData?.itemDetails ? {
                    name: item.richData.itemDetails.name,
                    imageUrl: undefined
                  } : undefined
                }
              } : {}),
              wardrobeItemId: undefined
            }
            : item
        );
        return updatedItems;
      });

      console.log('[AIHistory] Remove from wishlist: done');

      setIsHistoryDetailModalOpen(false);
      return true;
    } catch (error: any) {
      console.error('Failed to remove item from wishlist:', error.message || error);
      alert('Failed to remove item from wishlist. Please try again.');
      return false;
    }
  };

  const handleDismissHistoryItem = async (itemId: string) => {
    try {
      const result = await aiCheckHistoryService.updateRecordStatus(itemId, 'dismissed');

      if (!result.success) {
        throw new Error(result.error);
      }

      setHistoryItems((prev: AIHistoryItem[]) =>
        prev.map(item =>
          item.id === itemId
            ? { ...item, userActionStatus: UserActionStatus.DISMISSED }
            : item
        )
      );
      setIsHistoryDetailModalOpen(false);
    } catch (error: any) {
      console.error('Failed to update record status:', error.message || error);
    }
  };

  return {
    handleMoveToWishlist,
    handleMarkAsPurchased,
    handleRemoveFromWishlist,
    handleDismissHistoryItem,
  };
};
