import { useState } from 'react';
import { useAIModals } from './useAIModals';
import type { WardrobeItem } from '../../types';

interface UseAIAssistantModalsProps {
  onImageLinkChange: (imageUrl: string) => void;
  onWishlistItemSelect: (item: WardrobeItem | null) => void;
}

interface UseAIAssistantModalsReturn {
  // Modal states
  isAICheckModalOpen: boolean;
  isWishlistModalOpen: boolean;
  isCheckResultModalOpen: boolean;
  isRecommendationModalOpen: boolean;
  selectedWishlistItem: WardrobeItem | null;

  // Modal handlers
  setIsAICheckModalOpen: (open: boolean) => void;
  handleOpenWishlistModal: () => void;
  handleCloseWishlistModal: () => void;
  handleSelectWishlistItem: (item: WardrobeItem) => void;
  clearSelectedWishlistItem: () => void;
  handleOpenCheckResultModal: () => void;
  handleCloseCheckResultModal: () => void;
  handleCloseRecommendationModal: () => void;
  handleSaveRecommendation: () => void;
  handleSkipRecommendation: () => void;
}

export const useAIAssistantModals = ({
  onImageLinkChange,
  onWishlistItemSelect
}: UseAIAssistantModalsProps): UseAIAssistantModalsReturn => {
  const [isAICheckModalOpen, setIsAICheckModalOpen] = useState(false);
  const [selectedWishlistItem, setSelectedWishlistItem] = useState<WardrobeItem | null>(null);

  // Use existing useAIModals hook for other modal management
  const {
    // Modal states
    isWishlistModalOpen,
    isCheckResultModalOpen,
    isRecommendationModalOpen,

    // Handlers
    handleOpenWishlistModal,
    handleCloseWishlistModal,
    handleSelectWishlistItem: handleSelectWishlistItemRaw,
    handleOpenCheckResultModal,
    handleCloseCheckResultModal,
    handleCloseRecommendationModal,
    handleSaveRecommendation,
    handleSkipRecommendation,
  } = useAIModals({
    onItemSelect: (imageUrl, selectedItem) => {
      // Update image link when an item is selected from wishlist
      onImageLinkChange(imageUrl);
      // Store the selected wishlist item data
      const item = selectedItem || null;
      setSelectedWishlistItem(item);
      onWishlistItemSelect(item);
    }
  });

  // Enhanced wishlist item selection handler
  const handleSelectWishlistItem = (item: WardrobeItem) => {
    handleSelectWishlistItemRaw(item);
  };

  // Clear selected wishlist item
  const clearSelectedWishlistItem = () => {
    setSelectedWishlistItem(null);
  };

  return {
    // Modal states
    isAICheckModalOpen,
    isWishlistModalOpen,
    isCheckResultModalOpen,
    isRecommendationModalOpen,
    selectedWishlistItem,

    // Modal handlers
    setIsAICheckModalOpen,
    handleOpenWishlistModal,
    handleCloseWishlistModal,
    handleSelectWishlistItem,
    clearSelectedWishlistItem,
    handleOpenCheckResultModal,
    handleCloseCheckResultModal,
    handleCloseRecommendationModal,
    handleSaveRecommendation,
    handleSkipRecommendation,
  };
};
