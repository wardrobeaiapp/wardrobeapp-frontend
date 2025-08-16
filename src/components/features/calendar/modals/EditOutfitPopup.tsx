import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { WardrobeItem } from '../../../../types';
import { Modal, ModalAction } from '../../../common/Modal';


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

  const formattedDate = date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const actions: ModalAction[] = [
    { label: 'Cancel', onClick: onClose, variant: 'secondary' },
    { label: 'Save Changes', onClick: handleSaveChanges, variant: 'primary' }
  ];

  return (
    <Modal
      isOpen={visible}
      onClose={onClose}
      title={`Edit Outfit - ${formattedDate}`}
      actions={actions}
      size="md"
    >
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
    </Modal>
  );
};

export default EditOutfitPopup;
