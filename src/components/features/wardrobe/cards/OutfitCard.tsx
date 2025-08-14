import React from 'react';
import {
  Card,
  OutfitName,
  OutfitDetail,
  ButtonsContainer,
  SeasonTag,
  TagsContainer,
  OccasionTag,
  ItemImagesGrid,
  ItemImageSquare,
  ItemImagePlaceholder
} from './OutfitCard.styles';
import { Outfit, WardrobeItem } from '../../../../types';
import Button from '../../../common/Button';

interface OutfitCardProps {
  outfit: Outfit;
  onView: (outfit: Outfit) => void;
  onDelete: (id: string) => void;
  wardrobeItems?: WardrobeItem[];
}

const formatSeasonName = (season: string): string => {
  if (season === 'ALL_SEASON') return 'All Seasons';
  return season.toLowerCase();
};

const OutfitCard: React.FC<OutfitCardProps> = ({ outfit, onView, onDelete, wardrobeItems = [] }) => {
  // Get the actual item objects from IDs, limit to 4 for display
  const outfitItems = outfit.items.slice(0, 4).map(itemId => 
    wardrobeItems.find(item => item.id === itemId)
  ).filter(item => item !== undefined) as WardrobeItem[];

  return (
    <Card>
      <OutfitName>{outfit.name}</OutfitName>
      
      <TagsContainer>
        {outfit.season.map((season) => (
          <SeasonTag key={season}>{formatSeasonName(season)}</SeasonTag>
        ))}
      </TagsContainer>
      
      {outfit.occasion && (
        <OccasionTag>{outfit.occasion}</OccasionTag>
      )}
      
      <OutfitDetail>Items: {outfit.items.length}</OutfitDetail>
      
      <ItemImagesGrid>
        {outfitItems.map((item, index) => (
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
        {Array.from({ length: Math.max(0, 4 - outfitItems.length) }).map((_, index) => (
          <ItemImageSquare key={`empty-${index}`}>
            <ItemImagePlaceholder>+</ItemImagePlaceholder>
          </ItemImageSquare>
        ))}
      </ItemImagesGrid>
      
      <ButtonsContainer>
        <Button fullWidth onClick={() => onView(outfit)}>View</Button>
      </ButtonsContainer>
    </Card>
  );
};

export default OutfitCard;
