import styled, { keyframes } from 'styled-components';
import { theme } from '../styles/theme';

export const PageHeader = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

export const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 2rem;
`;

export const Tab = styled.button<{ $active: boolean }>`
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: ${props => (props.$active ? '600' : '400')};
  color: ${props => (props.$active ? theme.colors.primary : theme.colors.gray[500])};
  background: transparent;
  border: none;
  border-bottom: 2px solid ${props => (props.$active ? theme.colors.primary : 'transparent')};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    color: ${props => (props.$active ? theme.colors.primary : theme.colors.gray[600])};
  }`;

export const TooltipContainer = styled.div`
  position: relative;
  display: inline-block;
  
  @media (hover: hover) {
    &:hover .tooltip-text {
      visibility: visible;
      opacity: 1;
    }
  }
  
  @media (hover: none) {
    &:active .tooltip-text {
      visibility: visible;
      opacity: 1;
    }
  }
`;

export const TooltipText = styled.span`
  visibility: hidden;
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.85);
  color: white;
  text-align: center;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 0.75rem;
  white-space: nowrap;
  z-index: 1;
  opacity: 0;
  transition: opacity 0.2s, visibility 0.2s;
  margin-bottom: 8px;
  width: max-content;
  max-width: 250px;
  pointer-events: none;
  
  @media (max-width: 480px) {
    font-size: 0.7rem;
    white-space: normal;
    width: 200px;
  }
  
  &:focus {
    outline: none;
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

export const ItemsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 2rem;
  padding: 0.5rem 0;
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    padding: 0.25rem 0;
  }
  
  @media (min-width: 641px) and (max-width: 1024px) {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.75rem;
  }
  
  @media (min-width: 1025px) {
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 2rem;
  }
  
  @media (min-width: 1440px) {
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: 2.5rem;
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