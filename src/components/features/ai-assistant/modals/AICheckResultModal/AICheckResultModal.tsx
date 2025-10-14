import React, { useState } from 'react';
import { FaStar } from 'react-icons/fa';
import { WishlistStatus } from '../../../../../types';
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
  OutfitAnalysisContainer,
  OutfitAnalysisHeader,
  OutfitScenarioContainer,
  OutfitScenarioHeader,
  OutfitList,
  OutfitItem,
  OutfitHeader,
  OutfitText,
  ToggleButton,
  OutfitImagesContainer,
  OutfitImageGrid,
  OutfitItemThumbnail,
  ThumbnailImage,
  ThumbnailPlaceholder,
  ThumbnailLabel,
  IncompleteScenarios,
  IncompleteScenarioItem,
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
}

const AICheckResultModal: React.FC<AICheckResultModalProps> = ({
  isOpen,
  onClose,
  compatibleItems,
  outfitCombinations = [],
  seasonScenarioCombinations = [],
  coverageGapsWithNoOutfits = [],
  itemSubcategory = '',
  score,
  status,
  imageUrl,
  onAddToWishlist,
  onSkip,
  onDecideLater,
  error,
  errorDetails,
  recommendationAction,
  recommendationText
}) => {
  // State for tracking which outfits have expanded images
  const [expandedOutfits, setExpandedOutfits] = useState<Set<string>>(new Set());

  // Toggle function for outfit image visibility
  const toggleOutfitImages = (outfitId: string) => {
    setExpandedOutfits(prev => {
      const newSet = new Set(prev);
      if (newSet.has(outfitId)) {
        newSet.delete(outfitId);
      } else {
        newSet.add(outfitId);
      }
      return newSet;
    });
  };

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

  const actions: ModalAction[] = [
    {
      label: 'Add to wishlist',
      onClick: handleAddToWishlist,
      variant: 'primary',
      fullWidth: true
    },
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

        {/* Outfit Combinations Section - Backend Logging Format */}
        {(seasonScenarioCombinations.length > 0 || outfitCombinations.length > 0) && (() => {
          // Separate complete and incomplete scenarios
          const incompleteScenarios = seasonScenarioCombinations.filter((combo: any) => !combo.hasItems);
          
          // Calculate totals for summary
          const totalOutfits = outfitCombinations.reduce((sum: number, combo: any) => sum + (combo.outfits?.length || 0), 0);
          
          return (
            <OutfitAnalysisContainer>
              <OutfitAnalysisHeader>
                {(() => {
                  // Use the subcategory directly from form data, with fallback
                  const itemType = itemSubcategory || 'item';
                  
                  // Convert from enum format (e.g., "T_SHIRT") to display format (e.g., "t-shirt")
                  const displayType = itemType.toLowerCase().replace(/_/g, ' ');

                  if (totalOutfits === 0) {
                    return `This ${displayType} doesn't have enough matching pieces in your current wardrobe`;
                  }
                  return `You can make ${totalOutfits} new outfit${totalOutfits !== 1 ? 's' : ''} with this ${displayType}`;
                })()}
              </OutfitAnalysisHeader>

              {/* Complete Scenarios with Outfits */}
              {outfitCombinations.map((combo: any, index: number) => (
                <OutfitScenarioContainer key={index}>
                  <OutfitScenarioHeader>
                    {(() => {
                      const season = combo.season?.toLowerCase();
                      if (season === 'spring' || season === 'fall' || season === 'spring/fall') {
                        return 'SPRING/FALL';
                      }
                      return combo.season?.toUpperCase();
                    })()} + {combo.scenario?.toUpperCase()}
                  </OutfitScenarioHeader>
                  
                  <OutfitList>
                    {combo.outfits?.map((outfit: any, outfitIndex: number) => {
                      const itemNames = outfit.items?.map((item: any) => item.name) || [];
                      const outfitDescription = itemNames.join(' + ');
                      
                      // Create unique ID for this outfit
                      const outfitId = `${index}-${outfitIndex}`;
                      const isExpanded = expandedOutfits.has(outfitId);
                      
                      // Check if any items have images to show toggle (including analyzed item from modal)
                      const hasImages = outfit.items?.some((item: any) => {
                        // Check if item has imageUrl OR if it's the analyzed item and modal has imageUrl
                        if (item.imageUrl) return true;
                        if (imageUrl) {
                          const isAnalyzedItem = item.type === 'base-item' || 
                            (item.name && itemNames[0] && item.name === itemNames[0]);
                          if (isAnalyzedItem) return true;
                        }
                        return false;
                      }) || false;
                      
                      return (
                        <OutfitItem key={outfitIndex}>
                          <OutfitHeader>
                            <OutfitText>
                              {outfitIndex + 1}. {outfitDescription}
                            </OutfitText>
                            {hasImages && (
                              <ToggleButton
                                onClick={() => toggleOutfitImages(outfitId)}
                                title={isExpanded ? "Hide images" : "Show images"}
                              >
                                {isExpanded ? '👁️‍🗨️' : '👁️'}
                              </ToggleButton>
                            )}
                          </OutfitHeader>
                          
                          {hasImages && (
                            <OutfitImagesContainer $isExpanded={isExpanded}>
                              <OutfitImageGrid>
                                {outfit.items?.map((item: any, itemIndex: number) => {
                                  // Check if this is the analyzed item and inject the modal's imageUrl
                                  let itemImageUrl = item.imageUrl;
                                  if (!itemImageUrl && imageUrl) {
                                    // Try to match by name or if it's marked as the base item
                                    const isAnalyzedItem = item.type === 'base-item' || 
                                      (item.name && itemNames[0] && item.name === itemNames[0]);
                                    if (isAnalyzedItem) {
                                      itemImageUrl = imageUrl;
                                    }
                                  }
                                  
                                  return (
                                    <OutfitItemThumbnail key={itemIndex}>
                                      {itemImageUrl ? (
                                        <ThumbnailImage
                                          src={itemImageUrl}
                                          alt={item.name}
                                          onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                          }}
                                        />
                                      ) : (
                                        <ThumbnailPlaceholder>
                                          No Image
                                        </ThumbnailPlaceholder>
                                      )}
                                    </OutfitItemThumbnail>
                                  );
                                }) || []}
                              </OutfitImageGrid>
                            </OutfitImagesContainer>
                          )}
                        </OutfitItem>
                      );
                    }) || []}
                  </OutfitList>
                </OutfitScenarioContainer>
              ))}

              {/* Incomplete Scenarios */}
              {incompleteScenarios.length > 0 && (
                <IncompleteScenarios>
                  {incompleteScenarios.map((combo: any, index: number) => (
                    <IncompleteScenarioItem key={index}>
                      {combo.combination?.toUpperCase()} <span>- don't have {combo.missingCategories?.join(' or ') || 'items'} to combine with</span> 
                    </IncompleteScenarioItem>
                  ))}
                </IncompleteScenarios>
              )}
              
              {/* Coverage Gaps With No Outfits */}
              {coverageGapsWithNoOutfits && coverageGapsWithNoOutfits.length > 0 && (
                <div style={{ marginTop: '1rem' }}>
                  <div style={{
                    fontWeight: '700',
                    color: '#dc2626',
                    marginBottom: '0.5rem',
                    fontSize: '1rem'
                  }}>
                    ⚠️ COVERAGE GAPS CONFIRMED:
                  </div>
                  {coverageGapsWithNoOutfits.map((gap: any, index: number) => (
                    <div key={index} style={{
                      marginLeft: '1rem',
                      marginBottom: '0.25rem',
                      fontSize: '0.9rem',
                      color: '#6b7280'
                    }}>
                      • {gap.description} ({gap.gapType}) - No outfits possible with current wardrobe
                    </div>
                  ))}
                </div>
              )}
            </OutfitAnalysisContainer>
          );
        })()}
        
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
