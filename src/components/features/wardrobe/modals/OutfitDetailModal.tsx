import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Outfit, WardrobeItem } from '../../../../types';
import { formatCategory } from '../../../../utils/textFormatting';
import { Modal, ModalAction } from '../../../common/Modal';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import { OutfitInfo } from './OutfitDetailModal.styles';
import { DetailLabel, DetailRow, DetailValue, ItemCard, ItemContent, ItemDetail, ItemImage, SmallItemImageContainer, ItemName, ItemsGrid, PlaceholderImage, SeasonText, SectionTitle } from './modalCommon.styles';
import { ItemsSection } from './CapsuleDetailModal.styles';
import { getScenariosForUser as fetchScenarios } from '../../../../services/scenarios/scenariosService';
import { useSupabaseAuth } from '../../../../context/SupabaseAuthContext';

interface OutfitDetailModalProps {
  isOpen: boolean;
  outfit: Outfit;
  items: WardrobeItem[];
  onClose: () => void;
  onEdit: (outfit: Outfit) => void;
  onDelete: (id: string) => void;
}

const OutfitDetailModal: React.FC<OutfitDetailModalProps> = ({
  isOpen,
  outfit,
  items,
  onClose,
  onEdit,
  onDelete
}) => {
  // Memoize derived state
  const outfitItems = useMemo(() => 
    items.filter(item => outfit.items.includes(item.id)),
    [items, outfit.items]
  );

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [scenarioNames, setScenarioNames] = useState<string>('Loading...');
  const { user } = useSupabaseAuth();
  
  // Memoize the scenario names loading function
  const loadScenarioNames = useCallback(async (scenarios: string[] | undefined, currentUser: any) => {
    if (!scenarios) {
      setScenarioNames('No scenarios available');
      return;
    }
    
    if (scenarios.length === 0) {
      setScenarioNames('No scenarios selected');
      return;
    }
    
    if (!currentUser) {
      setScenarioNames(scenarios.join(', '));
      return;
    }
    
    try {
      const allScenarios = await fetchScenarios(currentUser.id);
      
      const names = scenarios
        .map(scenarioId => {
          const scenario = allScenarios.find(s => s.id === scenarioId);
          return scenario ? scenario.name : scenarioId;
        })
        .filter(Boolean);
      
      setScenarioNames(names.length > 0 ? names.join(', ') : 'Unknown scenarios');
    } catch (error) {
      console.error('Error fetching scenario names:', error);
      setScenarioNames(`Error: ${scenarios.join(', ')}`);
    }
  }, []);
  
  // Fetch scenarios to map IDs to names
  useEffect(() => {
    if (!outfit.scenarios) return;
    
    let isMounted = true;
    
    const loadData = async () => {
      await loadScenarioNames(outfit.scenarios, user);
    };
    
    if (isMounted) {
      loadData();
    }
    
    return () => {
      isMounted = false;
    };
  }, [outfit.scenarios, user, loadScenarioNames]);
  
  // Memoize callbacks
  const handleEdit = useCallback(() => onEdit(outfit), [onEdit, outfit]);
  const handleDeleteClick = useCallback(() => setShowDeleteConfirm(true), []);
  const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    (e.target as HTMLImageElement).style.display = 'none';
  }, []);
  
  // Memoize actions
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
      title={outfit.name}
      actions={actions}
      size="md"
    >
        <OutfitInfo>
          <DetailRow>
            <DetailLabel>Seasons</DetailLabel>
            <SeasonText>{outfit.season.join(', ')}</SeasonText>
          </DetailRow>
          
          <DetailRow>
            <DetailLabel>Scenarios</DetailLabel>
            <DetailValue>{scenarioNames}</DetailValue>
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
                  <SmallItemImageContainer>
                    {item.imageUrl ? (
                      <ItemImage 
                        src={item.imageUrl} 
                        alt={item.name} 
                        onError={handleImageError}
                        loading="lazy"
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
          onDelete(outfit.id);
          setShowDeleteConfirm(false);
        }}
        title="Delete Outfit"
        message="Are you sure you want to delete this outfit? This action cannot be undone."
        confirmText="Delete Outfit"
      />
    </Modal>
  );
};

export default OutfitDetailModal;
