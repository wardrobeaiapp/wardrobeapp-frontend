import React, { useState } from 'react';
import { Modal } from '../../../../common/Modal';
import { 
  ImageContainer,
  PreviewImage,
  ConstrainedItemImage
} from './AICheckResultModal.styles';
import DeleteConfirmationModal from '../../../wardrobe/modals/DeleteConfirmationModal';
import { WishlistStatus, WardrobeItem } from '../../../../../types';
import { DetectedTags } from '../../../../../services/ai/formAutoPopulation';
import OutfitCombinations from './OutfitCombinations';
import CompatibleItemsSection from './CompatibleItemsSection';
import RecommendationSection from './RecommendationSection';
import ItemDetailsSection from './ItemDetailsSection';
import { useMockSave } from './useMockSave';
import { createModalActions } from './modalActionsUtils';
import ItemImage from '../../../wardrobe/shared/ItemImage/ItemImage';

interface AICheckResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysisResult: string; // Technical analysis (for debugging, not displayed)
  suitableScenarios?: string[]; // Clean scenarios for display
  compatibleItems?: { [category: string]: any[] }; // Compatible items by category
  outfitCombinations?: any[]; // Complete outfit recommendations
  seasonScenarioCombinations?: any[]; // Season + scenario completion status
  coverageGapsWithNoOutfits?: any[]; // Coverage gaps that have 0 outfits available
  itemSubcategory?: string; // Item subcategory from form data
  score?: number;
  status?: WishlistStatus;
  imageUrl?: string;
  extractedTags?: DetectedTags | null;
  onAddToWishlist?: () => void; // For new items: open wishlist selection popup
  onApproveForPurchase?: () => void; // For wishlist items: mark as "want to buy" (SAVED status)
  onMarkAsPurchased?: () => void; // For saved items: mark as purchased (OBTAINED status)
  onRemoveFromWishlist?: () => void; // Remove from wishlist (DISMISSED status)  
  onSkip?: () => void;
  onDecideLater?: () => void;
  error?: string; // Error type from Claude API
  errorDetails?: string; // Detailed error message
  recommendationAction?: string; // "SKIP" / "RECOMMEND" / "MAYBE"
  recommendationText?: string; // Human-readable explanation
  hideActions?: boolean; // Hide action buttons (for demo mode)
  // New props for saving as mock
  selectedWishlistItem?: WardrobeItem | null; // The wardrobe item being analyzed
  showSaveMock?: boolean; // Whether to show Save as Mock button (only on AI Assistant page)
  onSaveMock?: (mockData: any) => Promise<void>;
  isHistoryItem?: boolean; // Whether this modal is displaying a history item
  userActionStatus?: string; // User action status for context-aware button logic
}

const AICheckResultModal: React.FC<AICheckResultModalProps> = ({
  isOpen,
  onClose,
  analysisResult,
  suitableScenarios,
  compatibleItems,
  outfitCombinations = [],
  seasonScenarioCombinations = [],
  coverageGapsWithNoOutfits = [],
  itemSubcategory = '',
  score,
  status,
  imageUrl,
  extractedTags,
  onAddToWishlist,
  onApproveForPurchase,
  onMarkAsPurchased,
  onRemoveFromWishlist,
  onSkip,
  onDecideLater,
  error,
  errorDetails,
  recommendationAction,
  recommendationText,
  hideActions = false,
  selectedWishlistItem,
  showSaveMock = false,
  onSaveMock,
  isHistoryItem = false,
  userActionStatus
}) => {
  // State for confirmation modal
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);

  // Use extracted mock save hook
  const { handleSaveMock } = useMockSave({
    selectedWishlistItem,
    onSaveMock
  });

  // Handler functions
  const handleAddToWishlist = () => {
    onAddToWishlist?.();
    onClose();
  };

  const handleSkip = () => {
    onSkip?.();
    onClose();
  };

  const handleDecideLater = () => {
    onDecideLater?.();
    onClose();
  };

  const handleMockSave = async () => {
    await handleSaveMock({
      score,
      suitableScenarios,
      compatibleItems,
      outfitCombinations,
      seasonScenarioCombinations,
      coverageGapsWithNoOutfits,
      itemSubcategory,
      status,
      extractedTags,
      recommendationAction,
      recommendationText,
      analysisResult,
      error,
      errorDetails
    });
  };

  // Handler for approving wishlist items for purchase (status PENDING → SAVED)
  const handleApproveForPurchase = () => {
    onApproveForPurchase?.();
    onClose();
  };

  // Handler for marking items as purchased (status SAVED → OBTAINED)
  const handleMarkAsPurchased = () => {
    onMarkAsPurchased?.();
    onClose();
  };

  // Handler for removing from wishlist (status → DISMISSED)
  const handleRemoveFromWishlist = () => {
    setIsConfirmationModalOpen(true);
  };

  // Handler for confirming removal
  const handleConfirmRemoval = () => {
    onRemoveFromWishlist?.();
    setIsConfirmationModalOpen(false);
    // Don't call onClose() here - the hook will handle closing after cleanup completes
  };

  // Use extracted actions utility
  const actions = createModalActions({
    hideActions,
    selectedWishlistItem,
    isHistoryItem,
    itemStatus: userActionStatus || status as string, // Use userActionStatus for button logic, fallback to status
    onAddToWishlist: handleAddToWishlist,
    onApproveForPurchase: handleApproveForPurchase,
    onMarkAsPurchased: handleMarkAsPurchased,
    onRemoveFromWishlist: handleRemoveFromWishlist,
    onSkip: handleSkip,
    onDecideLater: handleDecideLater,
    onSaveMock: handleMockSave
  });

  return (
    <>
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="AI Analysis Complete"
      actions={actions}
      size="md"
    >
        {(selectedWishlistItem || imageUrl) && (
          <ImageContainer>
            {selectedWishlistItem ? (
              <ConstrainedItemImage>
                <ItemImage 
                  item={selectedWishlistItem}
                  alt="Analyzed item"
                />
              </ConstrainedItemImage>
            ) : (
              <PreviewImage 
                src={imageUrl}
                alt="Analyzed item" 
              />
            )}
          </ImageContainer>
        )}
        
        <CompatibleItemsSection compatibleItems={compatibleItems} />

        {/* Outfit Combinations Section */}
        <OutfitCombinations
          outfitCombinations={outfitCombinations}
          seasonScenarioCombinations={seasonScenarioCombinations}
          coverageGapsWithNoOutfits={coverageGapsWithNoOutfits}
          itemSubcategory={itemSubcategory}
          imageUrl={imageUrl}
          compatibleItems={compatibleItems}
          selectedWishlistItem={selectedWishlistItem}
        />
        
        {/* Final Recommendation - Full width, before other details */}
        <RecommendationSection 
          recommendationAction={recommendationAction}
          recommendationText={recommendationText}
          score={score}
        />
        
        <ItemDetailsSection 
          error={error}
          errorDetails={errorDetails}
          score={score}
          status={status}
        />
    </Modal>

    {/* Confirmation Modal for Remove from Wishlist */}
    <DeleteConfirmationModal
      isOpen={isConfirmationModalOpen}
      onClose={() => setIsConfirmationModalOpen(false)}
      onConfirm={handleConfirmRemoval}
      title="Remove from Wishlist"
      message="Remove this item from wishlist permanently? This will delete all analysis data and cannot be undone."
      confirmText="Remove"
      cancelText="Cancel"
    />
  </>
  );
};

export default AICheckResultModal;
