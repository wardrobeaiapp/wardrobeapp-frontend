import React from 'react';
import { Capsule, WardrobeItem } from '../types';
import Button from './Button';
import useCapsuleItems from '../hooks/useCapsuleItems';
import {
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalTitle,
  CloseButton,
  CapsuleInfo,
  CapsuleInfoItem,
  CapsuleInfoLabel,
  CapsuleInfoValue,
  CapsuleSeasonTags,
  SeasonTag,
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
  ButtonGroup
} from './CapsuleDetailModal.styles';

interface CapsuleDetailModalProps {
  capsule: Capsule;
  items: WardrobeItem[];
  onClose: () => void;
  onEdit: (capsule: Capsule) => void;
  onDelete: (id: string) => void;
}

const CapsuleDetailModal: React.FC<CapsuleDetailModalProps> = ({
  capsule,
  items,
  onClose,
  onEdit,
  onDelete
}) => {
  // Use the capsuleItems hook to get the items in this capsule
  const { itemIds, loading } = useCapsuleItems(capsule.id);
  
  // Find the actual wardrobe items using the IDs from the capsule_items join table
  const capsuleItems = items.filter(item => itemIds.includes(item.id));
  
  // For backward compatibility, also check the selectedItems array if itemIds is empty
  const legacyItems = itemIds.length === 0 && capsule.selectedItems && capsule.selectedItems.length > 0 ? 
    items.filter(item => capsule.selectedItems?.includes(item.id) || false) : 
    [];
  
  // Combine both sources of items
  const allCapsuleItems = [...capsuleItems, ...legacyItems.filter(item => 
    !capsuleItems.some(ci => ci.id === item.id)
  )];
  
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
          <ModalTitle>{capsule.name}</ModalTitle>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </ModalHeader>
        
        <CapsuleInfo>
          <CapsuleInfoItem>
            <CapsuleInfoLabel>Description</CapsuleInfoLabel>
            <CapsuleInfoValue>{capsule.description || 'No description provided'}</CapsuleInfoValue>
          </CapsuleInfoItem>
          
          <CapsuleInfoItem>
            <CapsuleInfoLabel>Scenario</CapsuleInfoLabel>
            <CapsuleInfoValue>{capsule.scenario || 'No scenario provided'}</CapsuleInfoValue>
          </CapsuleInfoItem>
          
          <CapsuleInfoItem>
            <CapsuleInfoLabel>Seasons</CapsuleInfoLabel>
            <CapsuleSeasonTags>
              {capsule.seasons.map(season => (
                <SeasonTag key={season}>{season}</SeasonTag>
              ))}
            </CapsuleSeasonTags>
          </CapsuleInfoItem>
          
          <CapsuleInfoItem>
            <CapsuleInfoLabel>Created</CapsuleInfoLabel>
            <CapsuleInfoValue>{formatDate(capsule.dateCreated)}</CapsuleInfoValue>
          </CapsuleInfoItem>
        </CapsuleInfo>
        
        <ItemsSection>
          <SectionTitle>Items ({allCapsuleItems.length})</SectionTitle>
          
          {loading ? (
            <CapsuleInfoValue>Loading items...</CapsuleInfoValue>
          ) : allCapsuleItems.length === 0 ? (
            <CapsuleInfoValue>No items in this capsule</CapsuleInfoValue>
          ) : (
            <ItemsGrid>
              {allCapsuleItems.map(item => (
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
                    <ItemDetail>{item.category}, {item.color.toLowerCase()}</ItemDetail>
                  </ItemContent>
                </ItemCard>
              ))}
            </ItemsGrid>
          )}
        </ItemsSection>
        
        <ButtonGroup>
          <Button onClick={() => onDelete(capsule.id)}>Delete</Button>
          <Button onClick={() => onEdit(capsule)} primary>Edit</Button>
        </ButtonGroup>
      </ModalContent>
    </ModalOverlay>
  );
};

export default CapsuleDetailModal;
