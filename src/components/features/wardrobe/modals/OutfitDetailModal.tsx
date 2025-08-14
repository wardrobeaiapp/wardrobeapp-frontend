import React from 'react';
import { Outfit, WardrobeItem } from '../../../../types';
import { formatCategory } from '../../../../utils/textFormatting';

import {
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalTitle,
  CloseButton,
  OutfitInfo,
  DetailRow,
  DetailLabel,
  DetailValue,
  SeasonText,
  ItemsSection,
  SectionTitle,
  ItemsGrid,
  ItemCard,
  ItemImageContainer,
  ItemImage,
  PlaceholderImage,
  ItemContent,
  ItemName,
  ItemDetail,
  ButtonGroup,
  PrimaryButton,
  SecondaryButton
} from './OutfitDetailModal.styles';

interface OutfitDetailModalProps {
  outfit: Outfit;
  items: WardrobeItem[];
  onClose: () => void;
  onEdit: (outfit: Outfit) => void;
  onDelete: (id: string) => void;
}

const OutfitDetailModal: React.FC<OutfitDetailModalProps> = ({
  outfit,
  items,
  onClose,
  onEdit,
  onDelete
}) => {
  // Find the actual wardrobe items using the IDs stored in the outfit
  const outfitItems = items.filter(item => outfit.items.includes(item.id));

  return (
    <ModalOverlay>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>{outfit.name}</ModalTitle>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </ModalHeader>
        
        <OutfitInfo>
          <DetailRow>
            <DetailLabel>Seasons</DetailLabel>
            <SeasonText>{outfit.season.join(', ')}</SeasonText>
          </DetailRow>
          
          <DetailRow>
            <DetailLabel>Scenarios</DetailLabel>
            <DetailValue>{outfit.scenarios?.join(', ') || 'No scenarios provided'}</DetailValue>
          </DetailRow>
        </OutfitInfo>
        
        <ItemsSection>
          <SectionTitle>Items ({outfitItems.length})</SectionTitle>
          
          {outfitItems.length === 0 ? (
            <DetailValue>No items in this outfit</DetailValue>
          ) : (
            <ItemsGrid>
              {outfitItems.map(item => (
                <ItemCard key={item.id}>
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
                    <ItemDetail>{formatCategory(item.category)}, {item.color.toLowerCase()}</ItemDetail>
                  </ItemContent>
                </ItemCard>
              ))}
            </ItemsGrid>
          )}
        </ItemsSection>
        
        <ButtonGroup>
          <PrimaryButton onClick={() => onEdit(outfit)}>Edit</PrimaryButton>
          <SecondaryButton onClick={() => onDelete(outfit.id)}>Delete</SecondaryButton>
        </ButtonGroup>
      </ModalContent>
    </ModalOverlay>
  );
};

export default OutfitDetailModal;
