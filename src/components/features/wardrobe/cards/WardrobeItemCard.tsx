import React from 'react';
import { WardrobeItem, WishlistStatus } from '../../../../types';
import {
  Card,
  ImageContainer,
  ItemImage,
  PlaceholderImage,
  StatusIcon,
  CardContent,
  ItemName,
  ButtonContainer,
  TagsContainer,
} from './WardrobeItemCard.styles';
import Button from '../../../common/Button';
import { useImageUrl } from '../../../../hooks/core';
import SeasonTag from '../../../common/SeasonTag/SeasonTag';

interface WardrobeItemCardProps {
  item: WardrobeItem;
  onView?: (item: WardrobeItem) => void; // New onView prop
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  hideStatusIcon?: boolean;
}

const WardrobeItemCard: React.FC<WardrobeItemCardProps> = ({ item, onView, onEdit, onDelete, hideStatusIcon = false }) => {
  // Use the new hook for instant loading with fallback on expired URLs
  // For backward compatibility, also check for old base64 images
  const isBase64Image = item.imageUrl?.startsWith('data:image/');
  const { imageUrl, isLoading, error, onImageError } = useImageUrl(isBase64Image ? null : item);
  
  // For base64 images, use them directly; otherwise use the hook's URL
  const finalImageUrl = isBase64Image ? item.imageUrl : imageUrl;
  
  return (
    <Card>
      <ImageContainer>
        {finalImageUrl && !error ? (
          <ItemImage 
            src={finalImageUrl} 
            alt={item.name}
            onError={onImageError} // Handle expired URLs by triggering fallback
          />
        ) : isLoading ? (
          <PlaceholderImage>Loading...</PlaceholderImage>
        ) : error ? (
          <PlaceholderImage>Error loading image</PlaceholderImage>
        ) : (
          <PlaceholderImage>No Image</PlaceholderImage>
        )}
        
        {/* Display status icon for wishlist items */}
        {item.wishlist && !hideStatusIcon && (
          <StatusIcon $status={item.wishlistStatus || WishlistStatus.NOT_REVIEWED}>
            {item.wishlistStatus === WishlistStatus.APPROVED ? '✓' : 
             item.wishlistStatus === WishlistStatus.POTENTIAL_ISSUE ? '!' : '?'}
          </StatusIcon>
        )}
      </ImageContainer>
      
      <CardContent>
        <ItemName>{item.name}</ItemName>
        {item.season && item.season.length > 0 && (
          <TagsContainer $hasButtons={!!onView}>
            {item.season.flatMap((season) => 
              // Split 'spring/fall' into separate tags for display
              season === 'spring/fall' 
                ? ['spring', 'fall'] 
                : [season]
            ).map((displaySeason) => (
              <SeasonTag key={displaySeason} season={displaySeason} />
            ))}
          </TagsContainer>
        )}
        {onView && (
          <ButtonContainer>
            <Button fullWidth onClick={() => onView(item)}>
              View
            </Button>
          </ButtonContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default WardrobeItemCard;
