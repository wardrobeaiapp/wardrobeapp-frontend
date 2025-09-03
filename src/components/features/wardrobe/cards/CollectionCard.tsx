import React from 'react';
import {
  Card,
  CollectionName,
  CollectionDetail,
  ButtonsContainer,
  SeasonTag,
  TagsContainer,
  DescriptionText,
  ItemImagesGrid,
  ItemImageSquare,
  ItemImagePlaceholder
} from './CollectionCard.styles';
import { Outfit, Capsule, WardrobeItem } from '../../../../types';
import Button from '../../../common/Button';

interface CollectionCardProps {
  type: 'outfit' | 'capsule';
  data: Outfit | Capsule;
  onView: (data: Outfit | Capsule) => void;
  wardrobeItems?: WardrobeItem[];
}

const formatSeasonName = (season: string): string => {
  if (season === 'ALL_SEASON') return 'All Seasons';
  return season.toLowerCase();
};

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
          <SeasonTag key={season}>{formatSeasonName(season)}</SeasonTag>
        ))}
      </TagsContainer>
      
      {type === 'capsule' && (data as Capsule).description && (
        <DescriptionText>{(data as Capsule).description}</DescriptionText>
      )}
      
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
        <Button fullWidth onClick={() => onView(data)}>View</Button>
      </ButtonsContainer>
    </Card>
  );
};

export default CollectionCard;
