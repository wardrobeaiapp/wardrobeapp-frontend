import styled from 'styled-components';

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

export const AICard = styled.div`
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
    background: linear-gradient(135deg, #8b5cf6, #6d28d9);
    color: white;
  }
  
  &.recommendation {
    background: linear-gradient(135deg, #10b981, #047857);
    color: white;
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
  min-height: 120px;
  
  &:hover {
    border-color: #8b5cf6;
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
    border-color: #8b5cf6;
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
    border-color: #8b5cf6;
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

// Button styles

export const PrimaryButton = styled.button`
  width: 100%;
  padding: 0.875rem 1.5rem;
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(139, 92, 246, 0.3);
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(139, 92, 246, 0.4);
    background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(139, 92, 246, 0.3);
  }
  
  &.green {
    background: linear-gradient(135deg, #10b981 0%, #047857 100%);
    box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);
    
    &:hover {
      background: linear-gradient(135deg, #047857 0%, #065f46 100%);
      box-shadow: 0 4px 8px rgba(16, 185, 129, 0.4);
    }
  }
`;

export const SecondaryButton = styled.button`
  width: 100%;
  padding: 0.875rem 1.5rem;
  background: #f9fafb;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f3f4f6;
    border-color: #8b5cf6;
    color: #8b5cf6;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
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
  color: #8b5cf6;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  transition: color 0.2s ease;
  
  &:hover {
    color: #7c3aed;
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
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  background: white;
  font-size: 0.875rem;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #8b5cf6;
    ring: 2px;
    ring-color: #8b5cf6;
  }
`;

export const ExportButton = styled.button`
  padding: 0.5rem 1rem;
  background: #8b5cf6;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    background: #7c3aed;
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
    background: linear-gradient(135deg, #8b5cf6, #6d28d9);
    color: white;
  }
  
  &.recommendation {
    background: linear-gradient(135deg, #10b981, #047857);
    color: white;
  }
  
  &.score {
    background: linear-gradient(135deg, #f59e0b, #d97706);
    color: white;
  }
  
  &.calendar {
    background: linear-gradient(135deg, #8b5cf6, #6d28d9);
    color: white;
  }
  
  &.wishlist {
    background: linear-gradient(135deg, #ec4899, #be185d);
    color: white;
  }
  
  &.discarded {
    background: linear-gradient(135deg, #ef4444, #dc2626);
    color: white;
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
  padding: 1rem 0;
  border-bottom: 1px solid #f3f4f6;
  
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

export const LoadMoreButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  background: none;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  color: #8b5cf6;
  font-weight: 500;
  cursor: pointer;
  margin-top: 1rem;
  
  &:hover {
    background: #f9fafb;
    border-color: #8b5cf6;
  }
`;

export const NoHistoryMessage = styled.p`
  text-align: center;
  color: #6b7280;
  padding: 2rem;
`;
