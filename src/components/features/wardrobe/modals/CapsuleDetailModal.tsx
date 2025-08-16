import React, { useState } from 'react';
import { Capsule, WardrobeItem } from '../../../../types';
import { formatCategory } from '../../../../utils/textFormatting';
import { Modal, ModalAction } from '../../../common/Modal';
import DeleteConfirmationModal from './DeleteConfirmationModal';

import useCapsuleItems from '../../../../hooks/useCapsuleItems';
import {
  CapsuleInfo,
  ItemsSection,
  MainItemSection,
  MainItemCard,
  MainItemImageContainer,
  MainItemImage,
  MainItemPlaceholder,
  MainItemContent,
  MainItemName,
  MainItemDetail,
  MainItemBadge
} from './CapsuleDetailModal.styles';
import { 
  DetailLabel, 
  DetailRow, 
  DetailValue, 
  ItemCard, 
  ItemContent, 
  ItemDetail, 
  ItemImage, 
  ItemImageContainer,
  ItemName, 
  ItemsGrid, 
  PlaceholderImage, 
  SeasonText, 
  SectionTitle 
} from './modalCommon.styles';

interface CapsuleDetailModalProps {
  isOpen: boolean;
  capsule: Capsule;
  items: WardrobeItem[];
  onClose: () => void;
  onEdit: (capsule: Capsule) => void;
  onDelete: (id: string) => void;
}

const capitalizeFirstLetter = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const CapsuleDetailModal: React.FC<CapsuleDetailModalProps> = ({
  isOpen,
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
  
  // Find the main item
  const mainItemId = capsule.mainItemId || capsule.main_item_id;
  const mainItem = mainItemId ? allCapsuleItems.find(item => item.id === mainItemId) : null;
  
  // Filter out the main item from the regular items list
  const otherItems = mainItem ? allCapsuleItems.filter(item => item.id !== mainItem.id) : allCapsuleItems;

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const actions: ModalAction[] = [
    {
      label: 'Edit',
      onClick: () => onEdit(capsule),
      variant: 'primary',
      fullWidth: true
    },
    {
      label: 'Delete',
      onClick: () => setShowDeleteConfirm(true),
      variant: 'secondary',
      fullWidth: true
    }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={capitalizeFirstLetter(capsule.name)}
      actions={actions}
      size="md"
    >
        <CapsuleInfo>
          <DetailRow>
            <DetailLabel>Scenario</DetailLabel>
            <DetailValue>{capsule.scenario || 'No scenario provided'}</DetailValue>
          </DetailRow>
          
          <DetailRow>
            <DetailLabel>Seasons</DetailLabel>
            <SeasonText>{capsule.seasons.join(', ')}</SeasonText>
          </DetailRow>
        </CapsuleInfo>
        
        {/* Main Item Section */}
        {mainItem && (
          <MainItemSection>
            <SectionTitle>Main Item</SectionTitle>
            <MainItemCard>
              <MainItemImageContainer>
                {mainItem.imageUrl ? (
                  <MainItemImage 
                    src={mainItem.imageUrl} 
                    alt={mainItem.name} 
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <MainItemPlaceholder>No Image</MainItemPlaceholder>
                )}
              </MainItemImageContainer>
              <MainItemContent>
                <MainItemName>{mainItem.name}</MainItemName>
                <MainItemDetail>{formatCategory(mainItem.category)}, {mainItem.color.toLowerCase()}</MainItemDetail>
                <MainItemBadge>Primary Focus</MainItemBadge>
              </MainItemContent>
            </MainItemCard>
          </MainItemSection>
        )}
        
        {/* Other Items Section */}
        <ItemsSection>
          <SectionTitle>
            {mainItem ? `Other Items (${otherItems.length})` : `Items (${allCapsuleItems.length})`}
          </SectionTitle>
          
          {loading ? (
            <DetailValue>Loading items...</DetailValue>
          ) : otherItems.length === 0 && !mainItem ? (
            <DetailValue>No items in this capsule</DetailValue>
          ) : otherItems.length === 0 && mainItem ? (
            <DetailValue>No additional items in this capsule</DetailValue>
          ) : (
            <ItemsGrid>
              {otherItems.map(item => (
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
      
      <DeleteConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => {
          onDelete(capsule.id);
          setShowDeleteConfirm(false);
        }}
        title="Delete Capsule"
        message="Are you sure you want to delete this capsule? This action cannot be undone."
        confirmText="Delete Capsule"
      />
    </Modal>
  );
};

export default CapsuleDetailModal;
