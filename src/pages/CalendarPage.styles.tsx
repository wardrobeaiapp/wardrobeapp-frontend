import styled from 'styled-components';
import { theme } from '../styles/theme';

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

export const DotIndicator = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #3b82f6;
  margin-top: 4px;
`;
