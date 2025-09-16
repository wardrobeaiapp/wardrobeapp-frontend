import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Capsule, WardrobeItem } from '../../../../types';
import { formatCategory } from '../../../../utils/textFormatting';
import { Modal, ModalAction } from '../../../common/Modal';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import { useSupabaseAuth } from '../../../../context/SupabaseAuthContext';
import { getScenariosForUser as fetchScenarios } from '../../../../services/scenarios/scenariosService';

import { useCapsuleItems } from '../../../../hooks/wardrobe/capsules/useCapsuleItems';
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
  SmallItemImageContainer,
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
  // Get capsule items and loading state
  const { itemIds, loading } = useCapsuleItems(capsule.id);
  const { user } = useSupabaseAuth();
  
  // Memoize derived state
  const capsuleItems = useMemo(() => 
    items.filter(item => itemIds.includes(item.id)),
    [items, itemIds]
  );
  
  // Memoize legacy items for backward compatibility
  const legacyItems = useMemo(() => 
    (itemIds.length === 0 && capsule.selectedItems?.length) 
      ? items.filter(item => capsule.selectedItems?.includes(item.id) || false) 
      : [],
    [itemIds.length, capsule.selectedItems, items]
  );
  
  // Memoize combined capsule items
  const allCapsuleItems = useMemo(() => 
    [...capsuleItems, ...legacyItems.filter(item => 
      !capsuleItems.some(ci => ci.id === item.id)
    )],
    [capsuleItems, legacyItems]
  );
  
  // Get scenarios array, defaulting to an empty array if not present
  const scenarios = useMemo(() => capsule.scenarios || [], [capsule.scenarios]);

  // State for storing scenario names
  const [scenarioNames, setScenarioNames] = useState<string>('Not specified');
  
  // Memoize the loadScenarioNames function
  const loadScenarioNames = useCallback(async (currentScenarios: string[], currentUser: any) => {
    if (currentScenarios.length === 0 || !currentUser) return;
    
    try {
      const allScenarios = await fetchScenarios(currentUser.id);
      
      // Map scenario IDs to names
      const names = currentScenarios
        .map(scenarioId => allScenarios.find(s => s.id === scenarioId)?.name || scenarioId)
        .filter(Boolean);
      
      if (names.length > 0) {
        setScenarioNames(names.join(', '));
      }
    } catch (error) {
      console.error('Error fetching scenario names:', error);
      // Fallback to showing IDs if fetching fails
      setScenarioNames(currentScenarios.join(', '));
    }
  }, []);
  
  // Fetch scenarios to map IDs to names
  useEffect(() => {
    if (scenarios.length > 0 && user) {
      loadScenarioNames(scenarios, user);
    }
  }, [scenarios, user, loadScenarioNames]);
  
  // Memoize main item and other items
  const mainItemId = useMemo(() => capsule.mainItemId || capsule.main_item_id, [capsule]);
  
  const mainItem = useMemo(() => 
    mainItemId ? allCapsuleItems.find(item => item.id === mainItemId) : null,
    [mainItemId, allCapsuleItems]
  );
  
  const otherItems = useMemo(() => 
    mainItem ? allCapsuleItems.filter(item => item.id !== mainItem.id) : allCapsuleItems,
    [mainItem, allCapsuleItems]
  );

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Memoize callbacks
  const handleEdit = useCallback(() => onEdit(capsule), [onEdit, capsule]);
  const handleDeleteClick = useCallback(() => setShowDeleteConfirm(true), []);
  const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    (e.target as HTMLImageElement).style.display = 'none';
  }, []);
  
  const actions = useMemo<ModalAction[]>(() => [
    {
      label: 'Edit',
      onClick: handleEdit,
      variant: 'primary' as const,
      fullWidth: true
    },
    {
      label: 'Delete',
      onClick: handleDeleteClick,
      variant: 'secondary' as const,
      fullWidth: true
    }
  ], [handleEdit, handleDeleteClick]);

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
            <DetailLabel>Scenarios:</DetailLabel>
            <DetailValue>{scenarioNames}</DetailValue>
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
                    onError={handleImageError}
                    loading="lazy"
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
                  <SmallItemImageContainer>
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
                  </SmallItemImageContainer>
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
