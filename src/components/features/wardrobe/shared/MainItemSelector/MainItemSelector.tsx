import React from 'react';
import { WardrobeItem } from '../../../../../types';
import Button from '../../../../common/Button';
import {
  SelectedItemsContainer as StyledSelectedItemsContainer,
  SelectedItemBadge as StyledSelectedItemBadge,
  RemoveItemButton as StyledRemoveItemButton,
} from '../../forms/OutfitForm/OutfitForm.styles';

interface MainItemSelectorProps {
  /** ID of the currently selected main item */
  mainItemId: string;
  /** List of available items to select from */
  availableItems: WardrobeItem[];
  /** Callback when main item is changed */
  onMainItemChange: (itemId: string) => void;
  /** Callback when select button is clicked */
  onSelectClick: () => void;
  /** Custom label for the select button */
  selectButtonLabel?: string;
  /** Custom styles for the container */
  containerStyle?: React.CSSProperties;
  /** Custom styles for the badge */
  badgeStyle?: React.CSSProperties;
  /** Custom styles for the remove button */
  buttonStyle?: React.CSSProperties;
}

/**
 * A component for selecting a main item from a list of available items.
 * Shows the selected item with a remove button, or a button to select an item.
 */
const MainItemSelector: React.FC<MainItemSelectorProps> = ({
  mainItemId,
  availableItems,
  onMainItemChange,
  onSelectClick,
  selectButtonLabel = 'Select Main Item',
  containerStyle,
  badgeStyle,
  buttonStyle,
}) => {
  const mainItem = availableItems?.find(i => i.id === mainItemId);
  
  return (
    <div style={containerStyle}>
      {mainItem ? (
        <StyledSelectedItemsContainer>
          <StyledSelectedItemBadge style={badgeStyle}>
            {mainItem.name}
            <StyledRemoveItemButton 
              onClick={() => onMainItemChange('')}
              style={buttonStyle}
              aria-label="Remove main item"
            >
              &times;
            </StyledRemoveItemButton>
          </StyledSelectedItemBadge>
        </StyledSelectedItemsContainer>
      ) : (
        <Button fullWidth onClick={onSelectClick}>
          {selectButtonLabel}
        </Button>
      )}
    </div>
  );
};

export default MainItemSelector;
