import React, { useState } from 'react';
import ItemImage from '../../../wardrobe/shared/ItemImage/ItemImage';
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
  compatibleItems?: { [category: string]: any[] }; // Same refreshed items as the cards!
  selectedWishlistItem?: any; // The main analyzed item with working URL
}

const OutfitCombinations: React.FC<OutfitCombinationsProps> = ({
  outfitCombinations = [],
  seasonScenarioCombinations = [],
  coverageGapsWithNoOutfits = [],
  itemSubcategory = '',
  imageUrl,
  compatibleItems = {},
  selectedWishlistItem
}) => {
  // State for tracking which outfits have expanded images
  const [expandedOutfits, setExpandedOutfits] = useState<Set<string>>(new Set());

  // Simple function to find refreshed item from compatible items (SAME DATA AS CARDS!)
  const findRefreshedItem = (itemName: string): any => {
    // Search through all categories of compatible items
    for (const category of Object.values(compatibleItems)) {
      const item = category.find((item: any) => 
        item.name && item.name.toLowerCase() === itemName.toLowerCase()
      );
      if (item) {
        return item;
      }
    }
    return null;
  };

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
              
              // Check if any items have images to show toggle
              const hasImages = outfit.items?.some((item: any) => {
                // Check if refreshed item exists with imageUrl
                const refreshedItem = findRefreshedItem(item.name);
                if (refreshedItem?.imageUrl) return true;
                
                // Check if original item has imageUrl
                if (item.imageUrl) return true;
                
                // If no URL but this is the analyzed item, check selectedWishlistItem or imageUrl
                const isAnalyzedItem = item.type === 'base-item' || 
                  (item.name && itemNames[0] && item.name === itemNames[0]);
                if (isAnalyzedItem && (selectedWishlistItem?.imageUrl || imageUrl)) return true;
                
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
                          // Try to find refreshed item from compatible items (SAME DATA AS CARDS!)
                          const refreshedItem = findRefreshedItem(item.name);
                          
                          // Use the refreshed item if found, otherwise try main analyzed item for base items
                          let itemToRender = refreshedItem;
                          if (!itemToRender) {
                            const isAnalyzedItem = item.type === 'base-item' || 
                              (item.name && itemNames[0] && item.name === itemNames[0]);
                            if (isAnalyzedItem && selectedWishlistItem) {
                              // Use the main analyzed item with working URL
                              itemToRender = selectedWishlistItem;
                            } else if (isAnalyzedItem && imageUrl) {
                              // Fallback to imageUrl if no selectedWishlistItem
                              itemToRender = { imageUrl, name: item.name };
                            } else if (item.imageUrl) {
                              // Fallback to original item's imageUrl if it exists
                              itemToRender = item;
                            }
                          }
                          
                          return (
                            <OutfitItemThumbnail key={itemIndex}>
                              {itemToRender ? (
                                <div style={{ width: '50px', height: '50px', borderRadius: '6px', overflow: 'hidden' }}>
                                  <ItemImage 
                                    item={itemToRender}
                                    alt={item.name}
                                  />
                                </div>
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
