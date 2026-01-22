import { ModalAction } from '../../../../common/Modal';
import { WardrobeItem } from '../../../../../types';

interface CreateModalActionsProps {
  hideActions: boolean;
  showSaveMock?: boolean;
  isSavingMock?: boolean;
  mockSaveStatus?: 'idle' | 'success' | 'error';
  selectedWishlistItem?: WardrobeItem | null;
  isHistoryItem?: boolean; // Whether this modal is displaying a history item
  itemStatus?: string; // Current status of the history item for context-aware buttons
  onAddToWishlist: () => void; // For new items: open wishlist selection popup
  onApproveForPurchase?: () => void; // For wishlist items: mark as "want to buy" (SAVED status)
  onMarkAsPurchased?: () => void; // For saved items: mark as purchased (OBTAINED status)
  onRemoveFromWishlist?: () => void; // Remove from wishlist (DISMISSED status)
  onSkip: () => void;
  onDecideLater: () => void;
  onSaveMock?: () => void;
}

export const createModalActions = ({
  hideActions,
  showSaveMock,
  isSavingMock,
  mockSaveStatus,
  selectedWishlistItem,
  isHistoryItem,
  itemStatus,
  onAddToWishlist,
  onApproveForPurchase,
  onMarkAsPurchased,
  onRemoveFromWishlist,
  onSkip,
  onDecideLater,
  onSaveMock
}: CreateModalActionsProps): ModalAction[] => {
  // Only create actions if not hiding them (for demo mode)
  if (hideActions) {
    return [];
  }

  // For history items, determine if this was from a wishlist item
  const isFromWishlistItem = isHistoryItem && (
    selectedWishlistItem !== null && selectedWishlistItem !== undefined
  );

  const actions: ModalAction[] = [];

  // Context-aware buttons based on item status
  if (isHistoryItem && itemStatus) {
    if (itemStatus === 'saved') {
      // For saved items, show 2 buttons: Mark as purchased, Remove from wishlist
      actions.push(
        {
          label: 'Mark as purchased',
          onClick: () => onMarkAsPurchased?.(),
          variant: 'primary',
          fullWidth: true
        },
        {
          label: 'Remove from wishlist',
          onClick: () => onRemoveFromWishlist?.(),
          variant: 'secondary',
          fullWidth: true
        }
      );
    } else if (itemStatus === 'pending') {
      // For pending items, show Want to buy / Add to wishlist + Dismiss
      actions.push(
        {
          label: isFromWishlistItem ? 'Want to buy' : 'Add to wishlist',
          onClick: () => {
            if (isFromWishlistItem) {
              onApproveForPurchase?.();
            } else {
              onAddToWishlist();
            }
          },
          variant: 'primary',
          fullWidth: true
        },
        {
          label: isFromWishlistItem ? 'Remove from wishlist' : 'Dismiss',
          onClick: () => onRemoveFromWishlist?.(),
          variant: 'secondary',
          fullWidth: true
        }
      );
    } else if (itemStatus === 'dismissed') {
      // For dismissed items, no actions available (removal is final)
      // Items are permanently removed from wishlist
    } else if (itemStatus === 'obtained') {
      // For purchased items, show confirmation or option to remove
      actions.push({
        label: 'Remove from wishlist',
        onClick: () => onRemoveFromWishlist?.(),
        variant: 'secondary',
        fullWidth: true
      });
    }
  } else {
    // For fresh analysis (non-history items)
    actions.push({
      label: selectedWishlistItem ? 'Want to buy' : 'Add to wishlist',
      onClick: () => {
        if (selectedWishlistItem) {
          onApproveForPurchase?.();
        } else {
          onAddToWishlist();
        }
      },
      variant: 'primary',
      fullWidth: true
    });
  }

  // Add Save as Mock button only when showSaveMock is true (AI Assistant page only)
  // Button temporarily hidden per user request - functionality preserved
  if (false && showSaveMock) {
    actions.push({
      label: isSavingMock 
        ? 'Saving...' 
        : mockSaveStatus === 'success' 
          ? '✓ Saved as Mock' 
          : mockSaveStatus === 'error' 
            ? '✗ Save Failed' 
            : !selectedWishlistItem
              ? '💾 Save as Mock (Select item first)'
              : '💾 Save as Mock',
      onClick: onSaveMock,
      variant: mockSaveStatus === 'success' 
        ? 'primary' 
        : mockSaveStatus === 'error' 
          ? 'secondary' 
          : 'secondary',
      fullWidth: true,
      outlined: true,
      disabled: isSavingMock || mockSaveStatus === 'success' || !selectedWishlistItem
    } as ModalAction);
  }

  // Add remaining actions only for non-history items (fresh analysis)
  if (!isHistoryItem) {
    actions.push(
      {
        label: selectedWishlistItem ? 'Remove from wishlist' : 'Dismiss',
        onClick: selectedWishlistItem ? () => onRemoveFromWishlist?.() : onSkip,
        variant: 'secondary',
        fullWidth: true
      },
      {
        label: 'Decide later',
        onClick: onDecideLater,
        variant: 'secondary',
        fullWidth: true,
        outlined: true
      }
    );
  }

  return actions;
};
