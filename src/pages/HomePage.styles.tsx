import styled, { keyframes } from 'styled-components';
import { theme } from '../styles/theme';
import { MdCheckroom, MdOutlineStyle, MdOutlineWorkspaces, MdFavoriteBorder } from 'react-icons/md';

export const PageHeader = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

export const HeaderContent = styled.div`
  margin-bottom: 0;
`;

export const ButtonsContainer = styled.div`
  display: flex;
  gap: 0.5rem;
`;

export const MarkCompleteContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  height: 100%;
  justify-content: flex-start;
`;

export const MarkCompleteText = styled.span`
  font-size: 0.75rem;
  color: ${theme.colors.gray[500]};
  text-align: center;
  max-width: 200px;
  line-height: 1.2;
`;

export const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 2rem;
`;

// Tab button with icon and active state
interface TabProps {
  $active: boolean;
  $type: 'items' | 'outfits' | 'capsules' | 'wishlist';
}

export const Tab = styled.button<TabProps>`
  display: inline-flex !important;
  align-items: center !important;
  gap: 8px !important;
  padding: 12px 24px !important;
  border-radius: 25px !important;
  border: none !important;
  background: ${props => props.$active ? '#8B5CF6 !important' : 'transparent !important'};
  color: ${props => props.$active ? '#FFFFFF !important' : '#6B7280 !important'};
  font-weight: 500 !important;
  font-size: 14px !important;
  cursor: pointer !important;
  transition: all 0.2s ease !important;
  
  svg {
    margin-right: 8px;
    font-size: 16px;
  }
`;

export const FiltersContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

export const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const Select = styled.select`
  padding: 0.75rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  background-color: white;
  min-width: 150px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #d1d5db;
  }
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
  }
`;

export const SearchContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  min-width: 200px;
`;

export const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  background-color: white;
  font-size: 0.875rem;
  font-weight: 400;
  color: #374151;
  transition: all 0.2s ease;
  
  &::placeholder {
    color: #9ca3af;
  }
  
  &:hover {
    border-color: #d1d5db;
  }
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
  }
`;

export const SearchIcon = styled.div`
  position: absolute;
  left: 0.75rem;
  color: #6b7280;
  display: flex;
  align-items: center;
  pointer-events: none;
  z-index: 1;
`;

export const ItemsGrid = styled.div<{ $variant?: 'items' | 'default' }>`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  padding: 0.5rem 0;
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 1.25rem;
    padding: 0.25rem 0;
  }
  
  @media (min-width: 641px) and (max-width: 1024px) {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 1.5rem;
  }
  
  @media (min-width: 1025px) {
    ${props => props.$variant === 'items' 
      ? `grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
         gap: 1.5rem;`
      : `grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
         gap: 2rem;`
    }
  }
  
  @media (min-width: 1280px) {
    ${props => props.$variant === 'items' 
      ? `grid-template-columns: repeat(4, minmax(0, 1fr));
         gap: 1.5rem;`
      : `grid-template-columns: repeat(3, minmax(0, 1fr));
         gap: 2rem;`
    }
  }
`;

export const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  background-color: #f9fafb;
  border-radius: 0.5rem;
`;

export const EmptyStateTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #4b5563;
  margin-bottom: 1rem;
`;

export const EmptyStateText = styled.p`
  color: #6b7280;
  margin-bottom: 1.5rem;
`;

export const LoadingContainer = styled.div`
  text-align: center;
  padding: 2rem;
`;

export const LoadingText = styled.p`
  margin-bottom: 1rem;
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

export const Spinner = styled.div`
  display: inline-block;
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #3498db;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

export const ErrorContainer = styled.div`
  background-color: #ffebee;
  color: #c62828;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  text-align: center;
`;