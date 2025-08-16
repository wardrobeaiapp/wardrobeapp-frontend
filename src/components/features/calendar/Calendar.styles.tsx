import styled from 'styled-components';

// Re-export styles from CalendarPage.styles.tsx for use in the Calendar components
export {
  CalendarWrapper,
  DotIndicator,
  DetailsPanel,
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
  SelectionGrid,
  SelectionItem,
  SelectionItemName,
  SelectionItemCategory
} from '../../../pages/CalendarPage.styles';

// Add any additional styles specific to the Calendar components here
export const CalendarViewContainer = styled.div`
  width: 100%;
`;

export const ActionButtonsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;
