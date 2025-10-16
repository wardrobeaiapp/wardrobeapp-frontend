import React, { useState } from 'react';
import { FaStar, FaSave } from 'react-icons/fa';
import { WishlistStatus, WardrobeItem } from '../../../../../types';
import { Modal, ModalAction } from '../../../../common/Modal';
import {
  ItemDetails,
} from '../../../wardrobe/modals/ItemViewModal.styles';
import { 
  RecommendationBox, 
  RecommendationLabel, 
  RecommendationText,
  RecommendationSubText,
  ImageContainer,
  PreviewImage,
  ErrorLabel,
  ErrorValue,
  ErrorDetails,
  ScoreValue,
  CompatibleItemsContainer,
  CompatibleItemsHeader,
  CompatibleCategoryContainer,
  CompatibleCategoryTitle,
  CompatibleCategoryContent,
  CompatibleItemsGrid,
  CompatibleItemText,
  StatusValue
} from './AICheckResultModal.styles';
import { DetailLabel, DetailRow } from '../../../wardrobe/modals/modalCommon.styles';
import { DetectedTags } from '../../../../../services/ai/formAutoPopulation';
import OutfitCombinations from './OutfitCombinations';
import { 
  ItemCard,
  ItemImageContainer,
  ItemImage,
  PlaceholderImage,
  ItemContent,
  ItemName,
} from '../../../wardrobe/forms/OutfitForm/OutfitForm.styles';

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
  const [isSavingMock, setIsSavingMock] = useState(false);
  const [mockSaveStatus, setMockSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

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

  const handleSaveMock = async () => {
    if (!selectedWishlistItem || !onSaveMock) {
      console.error('Cannot save mock: missing wardrobe item or callback');
      return;
    }

    setIsSavingMock(true);
    setMockSaveStatus('idle');

    try {
      // Prepare the analysis data to save as mock
      const mockData = {
        compatibility: {
          score: score || 0,
          reasons: suitableScenarios || []
        },
        compatibleItems: compatibleItems || {},
        outfitCombinations: outfitCombinations || [],
        seasonScenarioCombinations: seasonScenarioCombinations || [],
        coverageGapsWithNoOutfits: coverageGapsWithNoOutfits || [],
        itemSubcategory: itemSubcategory || '',
        status: status || WishlistStatus.NOT_REVIEWED,
        extractedTags: extractedTags || null,
        recommendationAction: recommendationAction || '',
        recommendationText: recommendationText || '',
        analysisResult: analysisResult || '',
        error: error || null,
        errorDetails: errorDetails || null
      };

      console.log('Saving analysis as mock for item:', selectedWishlistItem.id, mockData);
      
      await onSaveMock(mockData);
      setMockSaveStatus('success');
      
      // Reset success status after 3 seconds
      setTimeout(() => setMockSaveStatus('idle'), 3000);
      
    } catch (error) {
      console.error('Error saving mock:', error);
      setMockSaveStatus('error');
      
      // Reset error status after 5 seconds
      setTimeout(() => setMockSaveStatus('idle'), 5000);
    } finally {
      setIsSavingMock(false);
    }
  };

  // Only create actions if not hiding them (for demo mode)
  const actions: ModalAction[] = hideActions ? [] : [
    {
      label: 'Add to wishlist',
      onClick: handleAddToWishlist,
      variant: 'primary',
      fullWidth: true
    },
    // Add Save as Mock button only when showSaveMock is true (AI Assistant page only)
    ...(showSaveMock ? [{
      label: isSavingMock 
        ? 'Saving...' 
        : mockSaveStatus === 'success' 
          ? '✓ Saved as Mock' 
          : mockSaveStatus === 'error' 
            ? '✗ Save Failed' 
            : !selectedWishlistItem
              ? '💾 Save as Mock (Select item first)'
              : '💾 Save as Mock',
      onClick: handleSaveMock,
      variant: mockSaveStatus === 'success' 
        ? 'primary' 
        : mockSaveStatus === 'error' 
          ? 'secondary' 
          : 'secondary',
      fullWidth: true,
      outlined: true,
      disabled: isSavingMock || mockSaveStatus === 'success' || !selectedWishlistItem
    } as ModalAction] : []),
    {
      label: 'Dismiss',
      onClick: handleSkip,
      variant: 'secondary',
      fullWidth: true
    },
    {
      label: 'Decide later',
      onClick: handleDecideLater,
      variant: 'secondary',
      fullWidth: true,
      outlined: true
    }
  ];

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
        
        {compatibleItems && Object.keys(compatibleItems).length > 0 && (
          <CompatibleItemsContainer>
            <CompatibleItemsHeader>
              Works well with:
            </CompatibleItemsHeader>
            {(() => {
              // User-friendly category name mapping
              const categoryNameMap: { [key: string]: string } = {
                'one_piece': 'dresses',
                'footwear': 'shoes',
                'tops': 'tops',
                'bottoms': 'bottoms',
                'outerwear': 'outerwear',
                'accessories': 'accessories'
              };

              // Separate categories with items from those without - ONLY from what backend actually returned
              const categoriesWithItems: Array<{ key: string; displayName: string; items: any[] }> = [];
              const categoriesWithoutItems: Array<{ key: string; displayName: string }> = [];

              // Only process categories that backend actually analyzed/returned
              Object.entries(compatibleItems).forEach(([category, items]) => {
                const displayName = categoryNameMap[category] || category;
                
                if (items && items.length > 0) {
                  categoriesWithItems.push({ key: category, displayName, items });
                } else {
                  // Show "No matching X in your wardrobe" for categories that were analyzed but returned empty
                  categoriesWithoutItems.push({ key: category, displayName });
                }
              });

              return (
                <>
                  {/* Render categories with items first */}
                  {categoriesWithItems.map(({ key, displayName, items }) => (
                    <CompatibleCategoryContainer key={key}>
                      <CompatibleCategoryTitle>
                        {displayName}:
                      </CompatibleCategoryTitle>
                      <CompatibleCategoryContent>
                        {/* Check if we have full item objects with IDs for card display */}
                        {items.some((item: any) => item.id) ? (
                          // Render as popup-style cards when we have full item objects
                          <CompatibleItemsGrid>
                            {items.map((item: any, index: number) => (
                              <ItemCard key={item.id || index} $isSelected={false}>
                                <ItemImageContainer>
                                  {item.imageUrl ? (
                                    <ItemImage 
                                      src={item.imageUrl} 
                                      alt={item.name} 
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                      }}
                                    />
                                  ) : (
                                    <PlaceholderImage>No Image</PlaceholderImage>
                                  )}
                                </ItemImageContainer>
                                <ItemContent>
                                  <ItemName>{item.name}</ItemName>
                                  {/* Hide category/color details for cleaner compatibility cards */}
                                </ItemContent>
                              </ItemCard>
                            ))}
                          </CompatibleItemsGrid>
                        ) : (
                          // Fallback to text when we don't have full item objects
                          <>
                            {items.map((item: any, index: number) => (
                              <CompatibleItemText key={index}>
                                • {item.name || 'Unnamed item'}
                              </CompatibleItemText>
                            ))}
                          </>
                        )}
                      </CompatibleCategoryContent>
                    </CompatibleCategoryContainer>
                  ))}

                  {/* Render categories without items at the end with friendly messages */}
                  {categoriesWithoutItems.map(({ key, displayName }) => (
                    <CompatibleCategoryContainer key={key}>
                      <CompatibleCategoryTitle>
                        {displayName}:
                      </CompatibleCategoryTitle>
                      <CompatibleCategoryContent>
                        <CompatibleItemText style={{ color: '#6b7280', fontStyle: 'italic' }}>
                          • No matching {displayName} in your wardrobe
                        </CompatibleItemText>
                      </CompatibleCategoryContent>
                    </CompatibleCategoryContainer>
                  ))}
                </>
              );
            })()}
          </CompatibleItemsContainer>
        )}

        {/* Outfit Combinations Section */}
        <OutfitCombinations
          outfitCombinations={outfitCombinations}
          seasonScenarioCombinations={seasonScenarioCombinations}
          coverageGapsWithNoOutfits={coverageGapsWithNoOutfits}
          itemSubcategory={itemSubcategory}
          imageUrl={imageUrl}
        />
        
        {/* Final Recommendation - Full width, before other details */}
        {recommendationAction && (() => {
          const recommendation = recommendationAction.toLowerCase();
          const isRecommend = recommendation.startsWith('recommend');
          const isMediumScore = score !== undefined && score >= 4 && score <= 8 && !isRecommend;
          
          return (
            <RecommendationBox
              $isRecommend={isRecommend}
              $isMediumScore={isMediumScore}
            >
              <RecommendationLabel>
                Final Recommendation
              </RecommendationLabel>
              <RecommendationText>
                {recommendationAction}
              </RecommendationText>
              {recommendationText && (
                <RecommendationSubText>
                  {recommendationText}
                </RecommendationSubText>
              )}
            </RecommendationBox>
          );
        })()}
        
        <ItemDetails>
          {/* Show error information if present */}
          {error && (
            <DetailRow>
              <ErrorLabel>Error:</ErrorLabel>
              <ErrorValue>
                {error.replace(/_/g, ' ')}
              </ErrorValue>
            </DetailRow>
          )}
          
          {/* Show error details if present */}
          {errorDetails && (
            <DetailRow>
              <ErrorLabel>Details:</ErrorLabel>
              <ErrorDetails>
                {errorDetails}
              </ErrorDetails>
            </DetailRow>
          )}
          
          {score !== undefined && (
            <DetailRow>
              <DetailLabel>Score:</DetailLabel>
              <ScoreValue>
                <FaStar size={14} color="#f59e0b" />
                {score}/10
              </ScoreValue>
            </DetailRow>
          )}
          
          {status && (
            <DetailRow>
              <DetailLabel>Status:</DetailLabel>
              <StatusValue $status={status}>
                {status.replace('_', ' ')}
              </StatusValue>
            </DetailRow>
          )}
        </ItemDetails>
    </Modal>
  );
};

export default AICheckResultModal;
