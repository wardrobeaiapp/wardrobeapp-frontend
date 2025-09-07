import { useState, useCallback } from 'react';
import { WardrobeItem } from '../../types';

interface UseAIModalsProps {
  onItemSelect?: (imageUrl: string) => void;
}

export const useAIModals = ({ onItemSelect }: UseAIModalsProps = {}) => {
  // Wishlist Selection Modal
  const [isWishlistModalOpen, setIsWishlistModalOpen] = useState(false);
  const [selectedWishlistItem, setSelectedWishlistItem] = useState<WardrobeItem | null>(null);

  // AI Check Result Modal
  const [isCheckResultModalOpen, setIsCheckResultModalOpen] = useState(false);
  
  // Recommendation Modal
  const [isRecommendationModalOpen, setIsRecommendationModalOpen] = useState(false);

  // Wishlist Modal Handlers
  const handleOpenWishlistModal = () => {
    setIsWishlistModalOpen(true);
  };

  const handleCloseWishlistModal = () => {
    setIsWishlistModalOpen(false);
    setSelectedWishlistItem(null);
  };

  const handleSelectWishlistItem = useCallback((item: WardrobeItem) => {
    setSelectedWishlistItem(item);
    // Set the image URL when an item is selected
    if (item.imageUrl && onItemSelect) {
      onItemSelect(item.imageUrl);
    }
  }, [onItemSelect]);

  // Check Result Modal Handlers
  const handleOpenCheckResultModal = () => {
    setIsCheckResultModalOpen(true);
  };

  const handleCloseCheckResultModal = () => {
    setIsCheckResultModalOpen(false);
  };

  // Recommendation Modal Handlers
  const handleOpenRecommendationModal = () => {
    setIsRecommendationModalOpen(true);
  };

  const handleCloseRecommendationModal = () => {
    setIsRecommendationModalOpen(false);
  };

  const handleSaveRecommendation = () => {
    // Handle save recommendation logic
    setIsRecommendationModalOpen(false);
  };

  const handleSkipRecommendation = () => {
    // Handle skip recommendation logic
    setIsRecommendationModalOpen(false);
  };

  return {
    // Modal states
    isWishlistModalOpen,
    isCheckResultModalOpen,
    isRecommendationModalOpen,
    selectedWishlistItem,
    
    // Wishlist Modal
    handleOpenWishlistModal,
    handleCloseWishlistModal,
    handleSelectWishlistItem,
    
    // Check Result Modal
    handleOpenCheckResultModal,
    handleCloseCheckResultModal,
    
    // Recommendation Modal
    handleOpenRecommendationModal,
    handleCloseRecommendationModal,
    handleSaveRecommendation,
    handleSkipRecommendation,
  };
};
