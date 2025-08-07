import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { WardrobeItem } from '../../types';

const PopupOverlay = styled.div`
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

const PopupContent = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 24px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const PopupHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const PopupTitle = styled.h2`
  margin: 0;
  font-size: 1.5rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
`;

const ItemList = styled.div`
  margin-bottom: 20px;
`;

const ItemRow = styled.div`
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
`;

const ItemColor = styled.div<{ color: string }>`
  width: 24px;
  height: 24px;
  border-radius: 4px;
  background-color: ${props => props.color || '#ccc'};
  margin-right: 12px;
`;

const ItemInfo = styled.div`
  flex: 1;
`;

const ItemName = styled.div`
  font-weight: 500;
`;

const ItemCategory = styled.div`
  font-size: 0.875rem;
  color: #666;
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: #ff4d4f;
  cursor: pointer;
  padding: 5px;
  margin-left: 10px;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
`;

const Button = styled.button<{ primary?: boolean }>`
  padding: 10px 20px;
  border-radius: 6px;
  border: none;
  font-weight: 500;
  cursor: pointer;
  background-color: ${props => props.primary ? '#7c3aed' : '#f3f4f6'};
  color: ${props => props.primary ? 'white' : '#374151'};
`;

interface EditOutfitPopupProps {
  visible: boolean;
  date: Date;
  outfitItems: WardrobeItem[];
  allItems: WardrobeItem[];
  onSave: (itemIds: string[]) => void;
  onClose: () => void;
}

const EditOutfitPopup: React.FC<EditOutfitPopupProps> = ({
  visible,
  date,
  outfitItems,
  allItems,
  onSave,
  onClose
}) => {
  const [selectedItems, setSelectedItems] = useState<WardrobeItem[]>([]);

  // Initialize selected items when popup opens
  useEffect(() => {
    if (visible) {
      setSelectedItems([...outfitItems]);
    }
  }, [visible, outfitItems]);

  const handleRemoveItem = (itemId: string) => {
    setSelectedItems(prev => prev.filter(item => item.id !== itemId));
  };

  const handleSaveChanges = () => {
    onSave(selectedItems.map(item => item.id));
  };

  if (!visible) return null;

  const formattedDate = date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <PopupOverlay>
      <PopupContent>
        <PopupHeader>
          <PopupTitle>Edit Outfit - {formattedDate}</PopupTitle>
          <CloseButton onClick={onClose}>×</CloseButton>
        </PopupHeader>

        <h3>Current Outfit</h3>
        <ItemList>
          {selectedItems.length > 0 ? (
            selectedItems.map(item => (
              <ItemRow key={item.id}>
                <ItemColor color={item.color} />
                <ItemInfo>
                  <ItemName>{item.name}</ItemName>
                  <ItemCategory>{item.category}</ItemCategory>
                </ItemInfo>
                <RemoveButton onClick={() => handleRemoveItem(item.id)}>
                  ✕
                </RemoveButton>
              </ItemRow>
            ))
          ) : (
            <p>No items in this outfit</p>
          )}
        </ItemList>

        <ButtonContainer>
          <Button onClick={onClose}>Cancel</Button>
          <Button primary onClick={handleSaveChanges}>Save Changes</Button>
        </ButtonContainer>
      </PopupContent>
    </PopupOverlay>
  );
};

export default EditOutfitPopup;
