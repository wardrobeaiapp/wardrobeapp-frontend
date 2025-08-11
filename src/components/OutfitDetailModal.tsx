import React from 'react';
import styled from 'styled-components';
import { Outfit, WardrobeItem } from '../types';
import { formatCategory } from '../utils/textFormatting';
import Button from './Button';

// Styled components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  border-radius: 0.5rem;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 1.5rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  color: #6b7280;
  
  &:hover {
    color: #111827;
  }
`;

const OutfitInfo = styled.div`
  margin-bottom: 2rem;
`;

const OutfitInfoItem = styled.div`
  margin-bottom: 1rem;
`;

const OutfitInfoLabel = styled.div`
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: #4b5563;
  font-size: 0.9rem;
`;

const OutfitInfoValue = styled.div`
  color: #111827;
`;

const OutfitSeasonTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const SeasonTag = styled.span`
  display: inline-block;
  background-color: #f3f4f6;
  border-radius: 9999px;
  padding: 0.2rem 0.5rem;
  font-size: 0.75rem;
`;

const OccasionTag = styled(SeasonTag)`
  background-color: #eef2ff;
  color: #4f46e5;
`;

const ItemsSection = styled.div`
  margin-top: 1.5rem;
`;

const SectionTitle = styled.h3`
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.1rem;
`;

const ItemsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
`;

const ItemCard = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
`;

const ItemImageContainer = styled.div`
  height: 150px;
  background-color: #f9fafb;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ItemImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

const PlaceholderImage = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  font-size: 0.8rem;
`;

const ItemContent = styled.div`
  padding: 0.75rem;
`;

const ItemName = styled.div`
  font-weight: 600;
  margin-bottom: 0.25rem;
  font-size: 0.9rem;
`;

const ItemDetail = styled.div`
  font-size: 0.8rem;
  color: #6b7280;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 2rem;
`;

interface OutfitDetailModalProps {
  outfit: Outfit;
  items: WardrobeItem[];
  onClose: () => void;
  onEdit: (outfit: Outfit) => void;
  onDelete: (id: string) => void;
}

const formatSeasonName = (season: string): string => {
  if (season === 'ALL_SEASON') return 'All Seasons';
  return season.charAt(0).toUpperCase() + season.slice(1).toLowerCase();
};

const OutfitDetailModal: React.FC<OutfitDetailModalProps> = ({
  outfit,
  items,
  onClose,
  onEdit,
  onDelete
}) => {
  // Find the actual wardrobe items using the IDs stored in the outfit
  const outfitItems = items.filter(item => outfit.items.includes(item.id));
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <ModalOverlay>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>{outfit.name}</ModalTitle>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </ModalHeader>
        
        <OutfitInfo>
          
          <OutfitInfoItem>
            <OutfitInfoLabel>Seasons</OutfitInfoLabel>
            <OutfitSeasonTags>
              {outfit.season.map(season => (
                <SeasonTag key={season}>{formatSeasonName(season)}</SeasonTag>
              ))}
            </OutfitSeasonTags>
          </OutfitInfoItem>
          
          {outfit.scenarios && outfit.scenarios.length > 0 && (
            <OutfitInfoItem>
              <OutfitInfoLabel>Scenarios</OutfitInfoLabel>
              <OutfitSeasonTags>
                {outfit.scenarios.map(scenario => (
                  <SeasonTag key={scenario}>{scenario}</SeasonTag>
                ))}
              </OutfitSeasonTags>
            </OutfitInfoItem>
          )}
          
          {outfit.occasion && (
            <OutfitInfoItem>
              <OutfitInfoLabel>Occasion</OutfitInfoLabel>
              <OccasionTag>{outfit.occasion}</OccasionTag>
            </OutfitInfoItem>
          )}
          
          {outfit.dateCreated && (
            <OutfitInfoItem>
              <OutfitInfoLabel>Created</OutfitInfoLabel>
              <OutfitInfoValue>{formatDate(outfit.dateCreated)}</OutfitInfoValue>
            </OutfitInfoItem>
          )}
        </OutfitInfo>
        
        <ItemsSection>
          <SectionTitle>Items ({outfitItems.length})</SectionTitle>
          
          {outfitItems.length === 0 ? (
            <OutfitInfoValue>No items in this outfit</OutfitInfoValue>
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
          <Button onClick={() => onDelete(outfit.id)}>Delete</Button>
          <Button onClick={() => onEdit(outfit)} primary>Edit</Button>
        </ButtonGroup>
      </ModalContent>
    </ModalOverlay>
  );
};

export default OutfitDetailModal;
