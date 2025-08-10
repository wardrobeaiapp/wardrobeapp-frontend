import React, { useState, useEffect } from 'react';
import { Outfit, WardrobeItem } from '../../types';
import { useWardrobe } from '../../context/WardrobeContext';
import ItemViewModal from '../../components/ItemViewModal';
import OutfitDetailModal from '../../components/OutfitDetailModal';
import { FaTrash } from 'react-icons/fa';
import {
  DetailsPanel,
  DetailsPanelTitle,
  DateDisplay,
  SelectionButtonsContainer,
  SelectionButton,
  OutfitCard,
  OutfitName,
  OutfitItems,
  OutfitItem,
  OutfitDetails,
  OutfitDetail,
  FormGroup,
  Label,
  Textarea,
  ButtonContainer,
  NoOutfitMessage,
  DayPlanDetailsContainer,
  ViewItemButton,
  ActionButtonsContainer
} from './Calendar.styles';
import styled from 'styled-components';
import Button from '../../components/Button';

interface DayPlanDetailsProps {
  selectedDate: Date;
  dayPlanExists: boolean;
  selectedOutfits: Outfit[];
  selectedDayItems: WardrobeItem[];
  selectedOutfitIds: string[];
  selectedItemIds: string[];
  notes: string;
  onNotesChange: (notes: string) => void;
  onSavePlan: () => void;
  onRemovePlan: () => void;
  onShowOutfitPopup: () => void;
  onShowItemPopup: () => void;
  onCopyFromDate?: () => void;
  onRemoveOutfit?: (outfitId: string) => void;
  onRemoveItem?: (itemId: string) => void;
}

const DayPlanDetails: React.FC<DayPlanDetailsProps> = ({
  selectedDate,
  dayPlanExists,
  selectedOutfits,
  selectedDayItems,
  selectedOutfitIds,
  selectedItemIds,
  notes,
  onNotesChange,
  onSavePlan,
  onRemovePlan,
  onShowOutfitPopup,
  onShowItemPopup,
  onCopyFromDate,
  onRemoveOutfit,
  onRemoveItem,
}) => {
  const { items } = useWardrobe();
  const [viewItem, setViewItem] = useState<WardrobeItem | undefined>(undefined);
  const [viewOutfit, setViewOutfit] = useState<Outfit | null>(null);
  
  // No debug logging needed anymore

  // Format the date for display
  const formatDate = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString(undefined, options);
  };

  return (
    <DayPlanDetailsContainer>
      <DetailsPanel>
        <DetailsPanelTitle>Plan Your Outfit</DetailsPanelTitle>
        <DateDisplay>{formatDate(selectedDate)}</DateDisplay>
      
      {dayPlanExists ? (
        <>
          {/* Display existing plan */}
          <SelectionButtonsContainer>
            <SelectionButton onClick={onShowOutfitPopup}>
              Outfits ({selectedOutfits.length})
            </SelectionButton>
            <SelectionButton onClick={onShowItemPopup}>
              Individual Items ({selectedDayItems.length})
            </SelectionButton>
            {onCopyFromDate && (
              <SelectionButton onClick={onCopyFromDate}>
                Copy from Date
              </SelectionButton>
            )}
          </SelectionButtonsContainer>
          
          {selectedOutfits.length === 0 && selectedDayItems.length === 0 ? (
            <NoOutfitMessage>No outfits planned for this day.</NoOutfitMessage>
          ) : (
            <>
              {selectedOutfits.length > 0 && (
                <>
                  <DetailsPanelTitle style={{ marginTop: '1rem' }}>Planned Outfits</DetailsPanelTitle>
                  {selectedOutfits.map(outfit => (
                    <OutfitCard key={outfit.id}>
                      <OutfitName>{outfit.name}</OutfitName>
                      <ActionButtonsContainer>
                        <ViewItemButton 
                          onClick={() => setViewOutfit(outfit)}
                        >
                          View
                        </ViewItemButton>
                        {onRemoveOutfit && (
                          <ViewItemButton 
                            onClick={() => onRemoveOutfit(outfit.id)}
                            style={{ backgroundColor: '#ff4d4d' }}
                          >
                            <FaTrash />
                          </ViewItemButton>
                        )}
                      </ActionButtonsContainer>
                      
                      <OutfitDetails>
                        {outfit.occasion && (
                          <OutfitDetail>
                            <strong>Occasion:</strong> {outfit.occasion}
                          </OutfitDetail>
                        )}
                        
                        {outfit.season && (
                          <OutfitDetail>
                            <strong>Season:</strong> {outfit.season.join(', ')}
                          </OutfitDetail>
                        )}
                      </OutfitDetails>
                    </OutfitCard>
                  ))}
                </>
              )}
              
              {selectedDayItems.length > 0 && (
                <>
                  <DetailsPanelTitle style={{ marginTop: '1.5rem' }}>Planned Items</DetailsPanelTitle>
                  <OutfitItems>
                    {selectedDayItems.map(item => (
                      <OutfitItem key={item.id}>
                        {item.name} ({item.category})
                        <ActionButtonsContainer>
                          <ViewItemButton 
                            onClick={(e) => {
                              e.stopPropagation();
                              setViewItem(item);
                            }}
                          >
                            View
                          </ViewItemButton>
                          {onRemoveItem && (
                            <ViewItemButton 
                              onClick={(e) => {
                                e.stopPropagation();
                                onRemoveItem(item.id);
                              }}
                              style={{ backgroundColor: '#ff4d4d' }}
                            >
                              <FaTrash />
                            </ViewItemButton>
                          )}
                        </ActionButtonsContainer>
                      </OutfitItem>
                    ))}
                  </OutfitItems>
                </>
              )}
              
              <FormGroup>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={e => onNotesChange(e.target.value)}
                  placeholder="Add any notes about this day's plan..."
                />
              </FormGroup>
              
              <ButtonContainer>
                <Button onClick={onRemovePlan}>Remove Plan</Button>
                <Button primary onClick={onSavePlan}>Save Changes</Button>
              </ButtonContainer>
            </>
          )}
        </>
      ) : (
        <>
          {/* Create new plan */}
          <SelectionButtonsContainer>
            <SelectionButton onClick={onShowOutfitPopup}>
              Select Outfits {selectedOutfitIds.length > 0 && `(${selectedOutfitIds.length})`}
            </SelectionButton>
            <SelectionButton onClick={onShowItemPopup}>
              Select Items {selectedItemIds.length > 0 && `(${selectedItemIds.length})`}
            </SelectionButton>
            {onCopyFromDate && (
              <SelectionButton onClick={onCopyFromDate}>
                Copy from Date
              </SelectionButton>
            )}
          </SelectionButtonsContainer>
          
          {/* Display selected outfits before saving */}
          {selectedOutfitIds.length > 0 && (
            <>
              <DetailsPanelTitle style={{ marginTop: '1rem' }}>Selected Outfits</DetailsPanelTitle>
              {selectedOutfits.map(outfit => (
                <OutfitCard key={outfit.id}>
                  <OutfitName>{outfit.name}</OutfitName>
                  <ViewItemButton 
                    onClick={() => setViewOutfit(outfit)}
                  >
                    View
                  </ViewItemButton>
                  
                  <OutfitDetails>
                    {outfit.occasion && (
                      <OutfitDetail>
                        <strong>Occasion:</strong> {outfit.occasion}
                      </OutfitDetail>
                    )}
                    
                    {outfit.season && (
                      <OutfitDetail>
                        <strong>Season:</strong> {outfit.season.join(', ')}
                      </OutfitDetail>
                    )}
                  </OutfitDetails>
                </OutfitCard>
              ))}
            </>
          )}
          
          {/* Display selected items before saving */}
          {selectedItemIds.length > 0 && (
            <>
              <DetailsPanelTitle style={{ marginTop: '1.5rem' }}>Selected Items</DetailsPanelTitle>
              <OutfitItems>
                {selectedDayItems.map(item => (
                  <OutfitItem key={item.id}>
                    {item.name} ({item.category})
                    <ActionButtonsContainer>
                      <ViewItemButton 
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewItem(item);
                        }}
                      >
                        View
                      </ViewItemButton>
                      {onRemoveItem && (
                        <ViewItemButton 
                          onClick={() => onRemoveItem(item.id)}
                          style={{ backgroundColor: '#ff4d4d' }}
                        >
                          <FaTrash />
                        </ViewItemButton>
                      )}
                    </ActionButtonsContainer>
                  </OutfitItem>
                ))}
              </OutfitItems>
            </>
          )}
          
          <FormGroup>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={e => onNotesChange(e.target.value)}
              placeholder="Add any notes about this day's plan..."
            />
          </FormGroup>
          
          <ButtonContainer>
            <Button 
              primary 
              onClick={onSavePlan} 
              disabled={selectedOutfitIds.length === 0 && selectedItemIds.length === 0}
            >
              Save Plan
            </Button>
          </ButtonContainer>
        </>
      )}
      </DetailsPanel>
      {viewItem && (
        <ItemViewModal
          isOpen={true}
          item={viewItem}
          onClose={() => setViewItem(undefined)}
          onEdit={() => {}}
          onDelete={(itemId: string) => {
            if (onRemoveItem) {
              onRemoveItem(itemId);
            }
            setViewItem(undefined);
          }}
        />
      )}
      {viewOutfit && (
        <OutfitDetailModal
          outfit={viewOutfit}
          items={items}
          onClose={() => setViewOutfit(null)}
          onEdit={() => {}}
          onDelete={() => {}}
        />
      )}
    </DayPlanDetailsContainer>
  );
};

export default DayPlanDetails;
