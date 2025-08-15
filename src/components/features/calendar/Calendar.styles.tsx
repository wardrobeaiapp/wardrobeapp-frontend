import styled from 'styled-components';

// Re-export styles from CalendarPage.styles.tsx for use in the Calendar components
export {
  CalendarWrapper,
  DotIndicator,
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
  PopupContainer,
  PopupContent,
  PopupHeader,
  SelectionGrid,
  SelectionItem,
  SelectionItemName,
  SelectionItemCategory
} from '../../../pages/CalendarPage.styles';

// Add any additional styles specific to the Calendar components here
export const CalendarViewContainer = styled.div`
  width: 100%;
`;


export const PopupTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
`;

export const PopupCloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;
`;

export const ActionButtonsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

export const PopupFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
`;
