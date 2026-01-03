import React from 'react';
import {
  CompatibleItemsContainer,
  CompatibleItemsHeader,
  CompatibleCategoryContainer,
  CompatibleCategoryTitle,
  CompatibleCategoryContent,
  CompatibleItemsGrid,
  CompatibleItemText,
} from './AICheckResultModal.styles';
import { 
  ItemCard,
  ItemImageContainer,
  PlaceholderImage,
  ItemContent,
  ItemName,
} from '../../../wardrobe/forms/OutfitForm/OutfitForm.styles';
import ItemImage from '../../../wardrobe/shared/ItemImage/ItemImage';

interface CompatibleItemsSectionProps {
  compatibleItems?: { [category: string]: any[] };
}

// User-friendly category name mapping
// Note: one_piece items could be dresses, jumpsuits, rompers, etc.
// Use generic term to avoid assuming specific item type
const CATEGORY_NAME_MAP: { [key: string]: string } = {
  'one_piece': 'one-piece items',
  'footwear': 'shoes',
  'tops': 'tops',
  'bottoms': 'bottoms',
  'outerwear': 'outerwear',
  'accessories': 'accessories'
};

const CompatibleItemsSection: React.FC<CompatibleItemsSectionProps> = ({
  compatibleItems
}) => {
  if (!compatibleItems || Object.keys(compatibleItems).length === 0) {
    return null;
  }

  // Separate categories with items from those without - ONLY from what backend actually returned
  const categoriesWithItems: Array<{ key: string; displayName: string; items: any[] }> = [];
  const categoriesWithoutItems: Array<{ key: string; displayName: string }> = [];

  // Only process categories that backend actually analyzed/returned
  Object.entries(compatibleItems).forEach(([category, items]) => {
    const displayName = CATEGORY_NAME_MAP[category] || category;
    
    if (items && items.length > 0) {
      categoriesWithItems.push({ key: category, displayName, items });
    } else {
      // Show "No matching X in your wardrobe" for categories that were analyzed but returned empty
      categoriesWithoutItems.push({ key: category, displayName });
    }
  });

  return (
    <CompatibleItemsContainer>
      <CompatibleItemsHeader>
        Works well with:
      </CompatibleItemsHeader>
      
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
                          item={item}
                          alt={item.name || 'Compatible item'} 
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
    </CompatibleItemsContainer>
  );
};

export default CompatibleItemsSection;
