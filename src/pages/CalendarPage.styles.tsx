import styled from 'styled-components';
import { theme } from '../styles/theme';
import { Card } from '../components/cards/Card.styles';

export const CalendarLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  
  @media (min-width: 1024px) {
    grid-template-columns: 7fr 3fr;
    align-items: stretch;
    min-height: 700px;
  }
`;

export const CalendarContainer = styled.div`
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 2rem;
`;

export const SidebarContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  height: 100%;
  position: relative;
  justify-content: space-between;
`;

export const SidebarCard = styled.div`
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
`;

export const OutfitContainer = styled.div`
  max-height: 250px;
  overflow-y: auto;
  margin-bottom: 1rem;
  scrollbar-width: thin;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
  }
`;

export const QuickActionsContainer = styled(SidebarCard)`
  margin-top: auto;
`;

export const SidebarDate = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 1.5rem;
`;

export const CalendarWrapper = styled.div`
  .react-calendar {
    width: 100%;
    max-width: 100%;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    font-family: inherit;
    line-height: 1.5;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  
  .react-calendar__tile {
    padding: 1rem 0.5rem;
    height: 120px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
  }
  
  .react-calendar__tile--hasOutfit {
    background-color: #e0f2fe;
    color: #0369a1;
  }
  
  .react-calendar__tile--active {
    background-color: ${theme.colors.primary} !important;
    color: white !important;
  }
  
  .outfit-indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: #3b82f6;
    margin-top: 4px;
  }
`;

export const DetailsPanel = styled.div`
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
`;

export const NoOutfitMessage = styled.p`
  color: #6b7280;
  text-align: center;
  padding: 2rem 0;
`;

// Use centralized Card with flat variant for subtle background
export const OutfitCard = styled(Card).attrs({ $variant: 'flat', $padding: 'lg' })`
  margin-bottom: 1.5rem;
`;

export const OutfitName = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 1rem;
`;

export const OutfitItems = styled.ul`
  margin: 0 0 1.5rem;
  padding-left: 1.5rem;
`;

export const OutfitItem = styled.li`
  margin-bottom: 0.5rem;
`;

export const OutfitDetails = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  color: #4b5563;
`;

export const OutfitDetail = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

export const Label = styled.label`
  font-weight: 500;
  color: #374151;
`;

export const Select = styled.select`
  padding: 0.625rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 1rem;
  background-color: white;
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
  }
`;

export const Textarea = styled.textarea`
  width: 100%;
  padding: 0.625rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-family: inherit;
  font-size: 0.875rem;
  min-height: 100px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
  }
`;

export const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 1.5rem;
  gap: 1rem;
`;

export const SelectionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1.5rem;
`;

export const SelectionItem = styled.div<{ selected: boolean }>`
  padding: 0.75rem;
  border-radius: 0.375rem;
  border: 1px solid ${props => props.selected ? '#3b82f6' : '#d1d5db'};
  background-color: ${props => props.selected ? '#eff6ff' : 'white'};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: #3b82f6;
    background-color: #f0f9ff;
  }
`;

export const SelectionItemName = styled.div`
  font-weight: 500;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
`;

export const SelectionItemCategory = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
`;

export const TabContainer = styled.div`
  display: flex;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 1.5rem;
`;

export const SelectionButtonsContainer = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
`;

export const StatsCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

export const StatsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const StatItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const StatLabel = styled.span`
  color: #4b5563;
  font-size: 1rem;
`;

export const StatValue = styled.span<{ color?: string }>`
  font-weight: 600;
  font-size: 1rem;
  color: ${props => props.color || '#1f2937'};
`;

export const SelectionButton = styled.button`
  padding: 0.625rem 1.25rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background-color: white;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background-color: #f9fafb;
  }
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
  }
`;

export const DotIndicator = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #3b82f6;
  margin-top: 4px;
`;

export const DateDisplay = styled.div`
  font-size: 1.25rem;
  font-weight: 500;
  color: #4b5563;
  margin-bottom: 1.5rem;
`;
