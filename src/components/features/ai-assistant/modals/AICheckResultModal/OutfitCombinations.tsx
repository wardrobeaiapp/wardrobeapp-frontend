import React, { useState } from 'react';
import {
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
  IncompleteScenarios,
  IncompleteScenarioItem,
} from './AICheckResultModal.styles';

interface OutfitCombinationsProps {
  outfitCombinations: any[];
  seasonScenarioCombinations: any[];
  coverageGapsWithNoOutfits: any[];
  itemSubcategory: string;
  imageUrl?: string;
}

const OutfitCombinations: React.FC<OutfitCombinationsProps> = ({
  outfitCombinations = [],
  seasonScenarioCombinations = [],
  coverageGapsWithNoOutfits = [],
  itemSubcategory = '',
  imageUrl
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

  // Don't render if no outfit data
  if (seasonScenarioCombinations.length === 0 && outfitCombinations.length === 0) {
    return null;
  }

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
};

export default OutfitCombinations;
