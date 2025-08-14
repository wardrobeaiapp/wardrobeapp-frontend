import styled from 'styled-components';
import { theme } from '../styles/theme';
import { Card } from '../components/cards/Card.styles';

export const PageContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

// Main cards layout
export const CardsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
  align-items: stretch; /* Make cards equal height */
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

// Use centralized Card with hover effects
export const AICard = styled(Card).attrs({ $variant: 'default', $padding: 'lg', $hoverable: true })`
  display: flex;
  flex-direction: column;
`;

// Card header with horizontal icon + title layout
export const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  
  > div {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-height: 2.5rem; /* Match icon height for visual balance */
  }
`;

export const CardIcon = styled.div`
  width: 2.5rem;
  height: 2.5rem;
  min-width: 2.5rem;
  max-width: 2.5rem;
  min-height: 2.5rem;
  max-height: 2.5rem;
  border-radius: 0.35rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
  flex-grow: 0;
  
  &.check {
    background-color: #e6f2ff;
    color: #3b82f6;
  }
  
  &.recommendation {
    background-color: #e6fff4;
    color: #10b981;
  }
`;

export const CardTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
`;

export const CardDescription = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
`;

// 2-column layout for AI Check card content
export const AICheckContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

export const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column; /* Stack buttons vertically */
  gap: 0.75rem;
  margin-top: auto; /* Push buttons to bottom */
  
  @media (max-width: 640px) {
    gap: 0.5rem;
  }
`;

export const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

// Upload area for AI Check
export const UploadArea = styled.div`
  position: relative;
  border: 2px dashed #d1d5db;
  border-radius: 0.5rem;
  padding: 2rem;
  text-align: center;
  transition: all 0.2s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 180px; /* Fixed height to prevent growing */
  overflow: hidden; /* Prevent content from overflowing */
  
  &:hover {
    border-color: ${theme.colors.primary};
    background-color: #faf5ff;
  }
`;

// Controls area for right column
export const ControlsArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const UploadIcon = styled.div`
  width: 3rem;
  height: 3rem;
  background: #f3f4f6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  font-size: 1.5rem;
  color: #6b7280;
`;

export const UploadText = styled.p`
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin: 0;
`;

// Input sections
export const InputSection = styled.div`
  margin-bottom: 0;
`;

export const InputLabel = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
`;

export const TextInput = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  box-sizing: border-box;
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
  }
  
  &::placeholder {
    color: #9ca3af;
  }
`;

// Select dropdown for Season and Scenario
export const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  box-sizing: border-box;
  background-color: white;
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
  }
`;

// Dropdown container for Season and Scenario
export const DropdownContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
`;

// History section
export const HistorySection = styled.div`
  background: #ffffff;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  border: 1px solid #e5e7eb;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  
  &:hover {
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  }
`;

export const HistoryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

export const HistoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const HistoryItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: #ffffff;
  border-radius: 0.75rem;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f9fafb;
    transform: translateX(4px);
    box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
  }
`;


export const HistoryContent = styled.div`
  flex: 1;
`;

export const HistoryItemTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.25rem;
`;

export const HistoryItemDescription = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
`;

export const HistoryTime = styled.span`
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 600;
  flex-shrink: 0;
`;

export const ViewAllButton = styled.button`
  background: none;
  border: none;
  color: ${theme.colors.primary};
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  transition: color 0.2s ease;
  
  &:hover {
    color: ${theme.colors.purple[600]};
  }
`;

export const HistoryDate = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
`;

export const HistoryTitle = styled.h4`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.5rem;
`;

export const HistoryDescription = styled.p`
  color: #4b5563;
  margin: 0;
  font-size: 0.875rem;
`;

// AI History Dashboard Components
export const DashboardContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

export const DashboardHeader = styled.div`
  margin-bottom: 2rem;
`;

export const DashboardTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
`;

export const DashboardSubtitle = styled.p`
  color: #6b7280;
  font-size: 1rem;
  margin: 0;
`;

export const DashboardTopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

export const FilterDropdown = styled.select`
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  background: white;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-sizing: border-box;
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
  }
`;

export const ExportButton = styled.button`
  padding: 0.5rem 1rem;
  background: ${theme.colors.primary};
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    background: ${theme.colors.purple[600]};
  }
`;

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

export const StatCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
`;

export const StatIcon = styled.div`
  width: 3rem;
  height: 3rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
  
  &.check {
    background-color: #e6f2ff;
    color: #3b82f6;
  }
  
  &.recommendation {
    background-color: #e6fff4;
    color: #10b981;
  }
  
  &.score {
    background-color: #fff5e6;
    color: #f59e0b;
  }
  
  &.calendar {
    background-color: #f5e6ff;
    color: #9c27b0;
  }
  
  &.wishlist {
    background-color: #f3e8ff;
    color: #9c27b0;
  }
  
  &.discarded {
    background-color: #ffe6e6;
    color: #ef4444;
  }
`;

export const StatContent = styled.div`
  flex: 1;
`;

export const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  line-height: 1;
  margin-bottom: 0.25rem;
`;

export const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
`;

export const ActivitySection = styled.div`
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
`;

export const ActivityHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

export const ActivityTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
`;

export const DashboardHistoryItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  transition: all 0.2s ease;
  border-radius: 0.5rem;
  
  &:hover {
    background: #f9fafb;
    transform: translateX(4px);
    box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

export const HistoryItemMeta = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
`;

export const ScoreContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

export const ScoreDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

export const ScoreText = styled.span`
  font-size: 0.875rem;
  font-weight: 600;
`;

export const LoadMoreButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  background: none;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  color: ${theme.colors.primary};
  font-weight: 500;
  cursor: pointer;
  margin-top: 1rem;
  
  &:hover {
    background: #f9fafb;
    border-color: ${theme.colors.primary};
  }
`;

export const StatusBadge = styled.div<{ $status: string }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
  margin-left: 0.5rem;
  background-color: ${props => {
    switch (props.$status) {
      case 'approved':
        return '#dcfce7'; // green-100
      case 'potential_issue':
        return '#fef3c7'; // amber-100  
      case 'not_reviewed':
      default:
        return '#f3f4f6'; // gray-100
    }
  }};
  color: ${props => {
    switch (props.$status) {
      case 'approved':
        return '#16a34a'; // green-600
      case 'potential_issue':
        return '#d97706'; // amber-600
      case 'not_reviewed':
      default:
        return '#4b5563'; // gray-600
    }
  }};
`;

// Tag containers for recommendation items
export const TagsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.25rem;
`;

export const ScenarioTag = styled.span`
  font-size: 0.75rem;
  background: #dbeafe;
  color: #2563eb;
  padding: 0.125rem 0.5rem;
  border-radius: 0.25rem;
  font-weight: 500;
`;

export const SeasonTag = styled.span`
  font-size: 0.75rem;
  background: #dcfce7;
  color: #16a34a;
  padding: 0.125rem 0.5rem;
  border-radius: 0.25rem;
  font-weight: 500;
`;
