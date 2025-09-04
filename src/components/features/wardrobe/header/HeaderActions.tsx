import React from 'react';
import { MdAdd } from 'react-icons/md';
import Button from '../../../../components/common/Button';
import { ButtonsContainer, MarkCompleteContainer, MarkCompleteText } from '../../../../pages/HomePage.styles';
import { TabType } from '../../../../hooks/home';

type HeaderActionsProps = {
  activeTab: string;
  onAddItem: () => void;
  onAddOutfit?: () => void;
  onAddCapsule?: () => void;
  onMarkComplete?: () => void;
};

const HeaderActions: React.FC<HeaderActionsProps> = ({
  activeTab,
  onAddItem,
  onAddOutfit = () => {},
  onAddCapsule = () => {},
  onMarkComplete = () => {},
}) => {
  if (activeTab === TabType.ITEMS) {
    return (
      <ButtonsContainer>
        <Button 
          size="lg" 
          onClick={onAddItem}
          style={{ height: '40px' }}
        >
          <MdAdd />
          Add Item
        </Button>
        <MarkCompleteContainer>
          <Button 
            size="lg" 
            variant="secondary" 
            outlined
            onClick={onMarkComplete}
          >
            Mark Wardrobe Complete
          </Button>
          <MarkCompleteText>
            Mark your wardrobe as complete to start tracking new purchases
          </MarkCompleteText>
        </MarkCompleteContainer>
      </ButtonsContainer>
    );
  }

  if (activeTab === TabType.OUTFITS) {
    return (
      <Button size="lg" onClick={onAddOutfit}>
        <MdAdd />
        Add Outfit
      </Button>
    );
  }

  if (activeTab === TabType.CAPSULES) {
    return (
      <Button size="lg" onClick={onAddCapsule}>
        <MdAdd />
        Add Capsule
      </Button>
    );
  }

  if (activeTab === TabType.WISHLIST) {
    return (
      <Button size="lg" onClick={onAddItem}>
        <MdAdd />
        Add Item
      </Button>
    );
  }

  return null;
};

export default HeaderActions;
