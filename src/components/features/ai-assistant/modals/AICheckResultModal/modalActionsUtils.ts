import { ModalAction } from '../../../../common/Modal';
import { WardrobeItem } from '../../../../../types';

interface CreateModalActionsProps {
  hideActions: boolean;
  showSaveMock: boolean;
  isSavingMock: boolean;
  mockSaveStatus: 'idle' | 'success' | 'error';
  selectedWishlistItem?: WardrobeItem | null;
  onAddToWishlist: () => void;
  onSkip: () => void;
  onDecideLater: () => void;
  onSaveMock: () => void;
}

export const createModalActions = ({
  hideActions,
  showSaveMock,
  isSavingMock,
  mockSaveStatus,
  selectedWishlistItem,
  onAddToWishlist,
  onSkip,
  onDecideLater,
  onSaveMock
}: CreateModalActionsProps): ModalAction[] => {
  // Only create actions if not hiding them (for demo mode)
  if (hideActions) {
    return [];
  }

  const actions: ModalAction[] = [
    {
      label: 'Add to wishlist',
      onClick: onAddToWishlist,
      variant: 'primary',
      fullWidth: true
    }
  ];

  // Add Save as Mock button only when showSaveMock is true (AI Assistant page only)
  if (showSaveMock) {
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

  // Add remaining actions
  actions.push(
    {
      label: 'Dismiss',
      onClick: onSkip,
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

  return actions;
};
