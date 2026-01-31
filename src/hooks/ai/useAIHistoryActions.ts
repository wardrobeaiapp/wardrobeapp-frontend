import { aiCheckHistoryService } from '../../services/ai/aiCheckHistoryService';
import type { WardrobeItem } from '../../types';

interface UseAIHistoryActionsProps {
  historyRecordId: string | null;
  selectedWishlistItem: WardrobeItem | null;
}

interface UseAIHistoryActionsReturn {
  handleApproveForPurchase: () => Promise<void>;
}

export const useAIHistoryActions = ({
  historyRecordId,
  selectedWishlistItem
}: UseAIHistoryActionsProps): UseAIHistoryActionsReturn => {

  // Handler for "Want to buy" button in AI Check Complete popup
  const handleApproveForPurchase = async () => {
    if (!historyRecordId) {
      console.warn('No history record ID available for approval');
      return;
    }

    try {
      const result = await aiCheckHistoryService.updateRecordStatus(historyRecordId, 'saved');
      
      if (result.success) {
        console.log('History record status updated to saved');
        
        // Get the updated record and dispatch it to trigger the history update listener
        const recordResult = await aiCheckHistoryService.getHistoryRecord(historyRecordId);
        if (recordResult.success && recordResult.record) {
          // Dispatch the updated item using the existing ai-history:created event
          // This will trigger the listener in useAIHistory hook to update the local state
          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('ai-history:created', { 
                detail: { historyRecordId } 
              })
            );
          }
        }
        
        // Trigger wardrobe:changed event to refresh UI
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('wardrobe:changed', { 
              detail: { type: 'updated', id: selectedWishlistItem?.id } 
            })
          );
        }
      } else {
        console.error('Failed to update history record status:', result.error);
      }
    } catch (error) {
      console.error('Error updating history record status:', error);
    }
  };

  return {
    handleApproveForPurchase
  };
};
