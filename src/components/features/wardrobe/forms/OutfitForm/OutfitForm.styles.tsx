import styled from 'styled-components';


export const ItemsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

// Use transient props with $ prefix to prevent isSelected from being forwarded to the DOM
export const ItemCard = styled.div<{ $isSelected: boolean }>`
  position: relative; // Required for absolutely positioned SelectionIndicator
  border: 1px solid ${props => props.$isSelected ? '#4f46e5' : '#e5e7eb'};
  border-radius: 0.375rem;
  padding: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
  background-color: ${props => props.$isSelected ? '#eef2ff' : 'white'};
  
  &:hover {
    border-color: ${props => props.$isSelected ? '#4f46e5' : '#d1d5db'};
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
`;

export const ItemImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 0.25rem;
  margin-bottom: 0.5rem;
`;

export const ItemName = styled.div`
  font-weight: 500;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
`;

export const ItemCategory = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
`;

export const SelectedItemBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background-color: #f3f4f6;
  border-radius: 0.25rem;
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
`;

export const RemoveItemButton = styled.button`
  background: none;
  border: none;
  color: #6b7280;
  font-size: 0.875rem;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  
  &:hover {
    color: #ef4444;
  }
`;

export const CheckboxContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1rem;
  max-height: 400px;
  overflow-y: auto;
`;

export const SelectedItemsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

export const ItemImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 150px;
  background-color: #f3f4f6;
`;

export const PlaceholderImage = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  font-size: 1rem;
`;

export const ItemContent = styled.div`
  padding-top: 0.75rem;
`;

export const ItemDetail = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 0.125rem;
`;

export const SelectionIndicator = styled.div`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  background-color: #6366f1;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 2;
`;

export const ResultsCount = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
`;

export const NoResultsMessage = styled.p`
  color: #6b7280;
  font-size: 0.875rem;
  text-align: center;
  padding: 1rem 0;
`;

