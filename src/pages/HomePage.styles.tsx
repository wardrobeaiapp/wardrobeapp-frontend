import styled, { keyframes } from 'styled-components';

export const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
`;

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
  color: ${props => (props.$active ? '#4f46e5' : '#6b7280')};
  background: transparent;
  border: none;
  border-bottom: 2px solid ${props => (props.$active ? '#4f46e5' : 'transparent')};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    color: ${props => (props.$active ? '#4f46e5' : '#4b5563')};
  }
  
  &:focus {
    outline: none;
  }
`;

export const FiltersContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background-color: #f9fafb;
  border-radius: 0.5rem;
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
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background-color: white;
  min-width: 150px;
`;

export const ItemsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
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
  border-radius: 0.5rem;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 0 1.5rem 1.5rem 1.5rem;
`;

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
`;

export const ModalTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
`;

export const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;
  
  &:hover {
    color: #1f2937;
  }
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
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 16px;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

export const CapsuleHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
  
  h3 {
    margin: 0;
    font-size: 18px;
    color: #333;
  }
`;

export const CapsuleSeasons = styled.div`
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
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
  margin: 0 0 16px 0;
  flex-grow: 1;
`;

export const CapsuleFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
`;

export const CapsuleItemCount = styled.span`
  font-size: 14px;
  color: #888;
`;

export const CapsuleActions = styled.div`
  display: flex;
  gap: 8px;
`;

export const ActionButton = styled.button`
  background: none;
  border: none;
  color: #4a90e2;
  font-size: 14px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  
  &:hover {
    background-color: #f0f7ff;
  }
`;
