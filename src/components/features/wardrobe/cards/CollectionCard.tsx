import React from 'react';
import {
  Card,
  CollectionName,
  CollectionDetail,
  ButtonsContainer,
  TagsContainer,
  ItemImagesGrid,
  ItemImageSquare,
  ItemImagePlaceholder
} from './CollectionCard.styles';
import { Outfit, Capsule, WardrobeItem } from '../../../../types';
import Button from '../../../common/Button';
import SeasonTag from '../../../common/SeasonTag/SeasonTag';

interface CollectionCardProps {
  type: 'outfit' | 'capsule';
  data: Outfit | Capsule;
  onView: (data: Outfit | Capsule) => void;
  wardrobeItems?: WardrobeItem[];
}

const CollectionCard: React.FC<CollectionCardProps> = ({ 
  type, 
  data, 
  onView, 
  wardrobeItems = [] 
}) => {
  // Get items based on type
  const itemIds = type === 'outfit' ? (data as Outfit).items : (data as Capsule).selectedItems || [];
  const collectionItems = itemIds.slice(0, 4).map(itemId => 
    wardrobeItems.find(item => item.id === itemId)
  ).filter(item => item !== undefined) as WardrobeItem[];

  // Get seasons based on type
  const seasons = type === 'outfit' ? (data as Outfit).season : (data as Capsule).seasons;

  return (
    <Card>
      <CollectionName>{data.name}</CollectionName>
      
      <TagsContainer>
        {seasons.map((season) => (
          <SeasonTag key={season} season={season} />
        ))}
      </TagsContainer>
      
      <CollectionDetail>
        Items: {itemIds.length}
      </CollectionDetail>
      
      <ItemImagesGrid>
        {collectionItems.map((item, index) => (
          <ItemImageSquare key={`${item.id}-${index}`}>
            {item.imageUrl ? (
              <img src={item.imageUrl} alt={item.name} />
            ) : (
              <ItemImagePlaceholder>
                {item.name.charAt(0).toUpperCase()}
              </ItemImagePlaceholder>
            )}
          </ItemImageSquare>
        ))}
        {/* Fill remaining slots if less than 4 items */}
        {Array.from({ length: Math.max(0, 4 - collectionItems.length) }).map((_, index) => (
          <ItemImageSquare key={`empty-${index}`}>
            <ItemImagePlaceholder>+</ItemImagePlaceholder>
          </ItemImageSquare>
        ))}
      </ItemImagesGrid>
      
      <ButtonsContainer>
        <Button fullWidth onClick={() => {
          console.log('[CollectionCard] View button clicked for', type, ':', data.id, data.name);
          onView(data);
        }}>View</Button>
      </ButtonsContainer>
    </Card>
  );
};

export default CollectionCard;
