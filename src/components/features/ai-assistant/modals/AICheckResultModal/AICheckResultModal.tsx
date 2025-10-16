import React from 'react';
import { WishlistStatus, WardrobeItem } from '../../../../../types';
import { Modal } from '../../../../common/Modal';
import { 
  ImageContainer,
  PreviewImage
} from './AICheckResultModal.styles';
import { DetectedTags } from '../../../../../services/ai/formAutoPopulation';
import OutfitCombinations from './OutfitCombinations';
import CompatibleItemsSection from './CompatibleItemsSection';
import RecommendationSection from './RecommendationSection';
import ItemDetailsSection from './ItemDetailsSection';
import { useMockSave } from './useMockSave';
import { createModalActions } from './modalActionsUtils';

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
  onAddToWishlist?: () => void;
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
  onSaveMock?: (mockData: any) => void; // Callback for saving mock data
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
  onSkip,
  onDecideLater,
  error,
  errorDetails,
  recommendationAction,
  recommendationText,
  hideActions = false,
  selectedWishlistItem,
  showSaveMock = false,
  onSaveMock
}) => {
  // Use extracted mock save hook
  const { isSavingMock, mockSaveStatus, handleSaveMock } = useMockSave({
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

  // Use extracted actions utility
  const actions = createModalActions({
    hideActions,
    showSaveMock,
    isSavingMock,
    mockSaveStatus,
    selectedWishlistItem,
    onAddToWishlist: handleAddToWishlist,
    onSkip: handleSkip,
    onDecideLater: handleDecideLater,
    onSaveMock: handleMockSave
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="AI Analysis Complete"
      actions={actions}
      size="md"
    >
        {imageUrl && (
          <ImageContainer>
            <PreviewImage 
              src={imageUrl} 
              alt="Analyzed item" 
            />
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
  );
};

export default AICheckResultModal;
