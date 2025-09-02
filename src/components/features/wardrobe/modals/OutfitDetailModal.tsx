import React, { useState, useEffect } from 'react';
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
  // Find the actual wardrobe items using the IDs stored in the outfit
  const outfitItems = items.filter(item => outfit.items.includes(item.id));

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [scenarioNames, setScenarioNames] = useState<string>('');
  
  const { user } = useSupabaseAuth();
  
  // Fetch scenarios to map IDs to names
  useEffect(() => {
    const loadScenarioNames = async () => {
      if (outfit.scenarios && outfit.scenarios.length > 0 && user) {
        try {
          const allScenarios = await fetchScenarios(user.id);
          
          // Map scenario IDs to names
          const names = outfit.scenarios.map(scenarioId => {
            const scenario = allScenarios.find(s => s.id === scenarioId);
            return scenario ? scenario.name : scenarioId;
          }).filter(Boolean);
          
          setScenarioNames(names.join(', '));
        } catch (error) {
          console.error('Error fetching scenario names:', error);
          // Fallback to showing IDs if fetching fails
          setScenarioNames(outfit.scenarios.join(', '));
        }
      } else {
        setScenarioNames('No scenarios provided');
      }
    };
    
    loadScenarioNames();
  }, [outfit.scenarios]);

  const actions: ModalAction[] = [
    {
      label: 'Edit',
      onClick: () => onEdit(outfit),
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
