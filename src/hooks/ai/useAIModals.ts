import { useState, useCallback } from 'react';
import { WardrobeItem } from '../../types';

interface UseAIModalsProps {
  onItemSelect?: (imageUrl: string, selectedItem?: WardrobeItem) => void;
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

  const handleSelectWishlistItem = useCallback(async (item: WardrobeItem) => {
    setSelectedWishlistItem(item);
    
    // Ensure imageUrl exists and is a string
    if (!item.imageUrl || typeof item.imageUrl !== 'string' || !onItemSelect) {
      return;
    }
    
    const imageUrl = item.imageUrl;
    
    try {
      // If it's already a base64 image, use it directly
      if (imageUrl.startsWith('data:image')) {
        onItemSelect(imageUrl, item);
        return;
      }
      
      // Otherwise, fetch the image and convert to base64
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      const reader = new FileReader();
      
      reader.onloadend = () => {
        const base64data = reader.result as string;
        onItemSelect(base64data, item);
      };
      
      reader.onerror = () => {
        console.error('Error converting image to base64');
        // Fallback to original URL if conversion fails
        onItemSelect(imageUrl, item);
      };
      
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error('Error processing wishlist item image:', error);
      // Fallback to original URL if there's an error
      onItemSelect(imageUrl, item);
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
