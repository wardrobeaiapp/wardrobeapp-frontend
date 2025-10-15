import styled, { keyframes } from 'styled-components';
import { theme } from '../styles/theme';

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
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border: none;
  background: transparent;
  color: ${props => props.$active ? theme.colors.primary : theme.colors.gray[600]};
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: color 0.2s ease;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    right: 0;
    height: 2px;
    background-color: ${props => props.$active ? theme.colors.primary : 'transparent'};
    transition: background-color 0.2s ease;
  }
  
  &:hover {
    color: ${theme.colors.primary};
  }
  
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
  
  @media (max-width: 768px) {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    
    /* Search takes full width (spans both columns) */
    > :first-child {
      grid-column: 1 / -1;
    }
    
    /* Category and Season sit side by side */
    > :nth-child(2),
    > :nth-child(3) {
      grid-column: span 1;
    }
    
    /* Scenario and Status take full width */
    > :nth-child(n+4) {
      grid-column: 1 / -1;
    }
  }
  
  @media (max-width: 640px) {
    gap: 0.75rem;
  }
`;

export const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
  
  @media (max-width: 768px) {
    gap: 0.25rem;
    min-width: 0; /* Allow shrinking in grid */
    width: 100% !important;
    
    /* Ensure search container takes full width */
    &:first-child {
      width: 100% !important;
    }
  }
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
  
  @media (max-width: 768px) {
    width: 100%;
    min-width: unset;
    padding: 0.625rem 0.75rem;
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

export const SearchContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  min-width: 200px;
  
  @media (max-width: 768px) {
    width: 100% !important;
    min-width: 0 !important;
    max-width: 100%;
    flex: 1;
  }
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
  
  @media (max-width: 768px) {
    padding: 0.625rem 0.75rem 0.625rem 2.5rem;
  }
  
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
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
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