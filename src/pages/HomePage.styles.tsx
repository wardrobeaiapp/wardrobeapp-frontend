import styled, { keyframes } from 'styled-components';
import { theme } from '../styles/theme';

export const PageHeader = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

export const Title = styled.h1`
  font-size: 1.875rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
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

export const FilterLabel = styled.label`
  font-weight: 500;
  font-size: 0.875rem;
  color: #4b5563;
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

export const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 50;
`;

export const ModalContent = styled.div`
  background-color: white;
  border-radius: 12px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 0;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
`;

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 1.5rem 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  background-color: white;
  border-radius: 12px 12px 0 0;
  z-index: 1;
`;

export const ModalTitle = styled.h2`
  font-size: 1.375rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
`;

export const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;
  padding: 0.25rem;
  border-radius: 6px;
  transition: all 0.2s ease;
  
  &:hover {
    color: #1f2937;
    background-color: #f3f4f6;
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
  }
`;

export const ModalBody = styled.div`
  padding: 1.5rem;
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

// Styled components for capsules
export const CapsuleCard = styled.div`
  display: flex;
  flex-direction: column;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1);
  background-color: white;
  border: 1px solid #f3f4f6;
  transition: all 0.3s ease;
  padding: 1.25rem;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
    border-color: #e5e7eb;
  }
`;

export const CapsuleSeasons = styled.div`
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  margin-bottom: 0.5rem;
`;

export const SeasonTag = styled.span`
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 12px;
  background-color: #f0f0f0;
  color: #666;
`;

export const CapsuleDescription = styled.p`
  color: #666;
  font-size: 14px;
  margin: 0 0 0.75rem 0;
`;



export const CapsuleItemCount = styled.p`
  margin: 0.25rem 0;
  font-size: 0.9rem;
  color: #4b5563;
`;

export const CapsuleActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
`;

export const ActionButton = styled.button`
  flex: 1;
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, ${theme.colors.purple[500]} 0%, ${theme.colors.purple[600]} 100%);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(139, 92, 246, 0.2);
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(139, 92, 246, 0.4);
    background: linear-gradient(135deg, ${theme.colors.purple[600]} 0%, ${theme.colors.purple[700]} 100%);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(139, 92, 246, 0.3);
  }
`;

export const CapsuleImagesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
  margin: 1rem 0;
`;

export const CapsuleImageSquare = styled.div`
  aspect-ratio: 1;
  border-radius: 0.5rem;
  overflow: hidden;
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  position: relative;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export const CapsuleImagePlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f3f4f6;
  color: #9ca3af;
  font-size: 0.875rem;
  font-weight: 600;
`;

