import styled from 'styled-components';

export const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  padding: 0;
`;

export const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const ThreeColumnRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
  
  @media (max-width: 1024px) and (min-width: 769px) {
    grid-template-columns: 1fr 1fr;
    
    & > :last-child {
      grid-column: span 2;
    }
  }
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const Label = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.25rem;
  display: block;
  
  &.required::after {
    content: ' *';
    color: #ef4444;
  }
`;

export const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #8b5cf6;
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
  }
  
  &::placeholder {
    color: #9ca3af;
  }
`;

export const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  resize: vertical;
  min-height: 80px;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #8b5cf6;
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
  }
  
  &::placeholder {
    color: #9ca3af;
  }
`;

export const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  background-color: white;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #8b5cf6;
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
  }
`;

export const ItemsModal = styled.div`
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
  z-index: 60;
`;

export const ItemsModalContent = styled.div`
  background-color: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
`;

export const ItemsModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
`;

export const ItemsModalTitle = styled.h3`
  font-size: 1.125rem;
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

export const FilterContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
`;

export const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

export const FilterLabel = styled.label`
  font-size: 0.75rem;
  font-weight: 500;
  color: #4b5563;
`;

export const FilterSelect = styled.select`
  padding: 0.375rem 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  min-width: 120px;
`;

export const FilterInput = styled.input`
  padding: 0.375rem 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  min-width: 120px;
`;

export const ItemsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

// Use transient props with $ prefix to prevent isSelected from being forwarded to the DOM
export const ItemCard = styled.div<{ $isSelected: boolean }>`
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

export const NoItemsMessage = styled.div`
  color: #6b7280;
  font-size: 0.875rem;
  text-align: center;
  padding: 1rem 0;
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

export const CheckboxItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0;
  
  /* Ensure any nested checkboxes get purple styling */
  input[type="checkbox"] {
    accent-color: #8b5cf6 !important;
    width: 16px;
    height: 16px;
  }
`;

export const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
`;

export const SeasonCheckboxes = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  
  /* Ensure all checkbox inputs within get purple styling */
  input[type="checkbox"] {
    accent-color: #8b5cf6 !important;
    width: 16px;
    height: 16px;
  }
`;

export const SelectedItemsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

export const ButtonsContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1rem;
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
  padding: 0.75rem;
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

export const FiltersContainer = styled.div`
  margin-bottom: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  padding: 1rem;
  background-color: #f9fafb;
`;

export const FilterRow = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

export const SearchInput = styled(FilterInput)`
  width: 100%;
  margin-bottom: 0.75rem;
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

export const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1rem;
`;

// Modern Button Styles (matching WardrobeItemForm)
export const ModernSubmitButton = styled.button`
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const ModernCancelButton = styled.button`
  background: #f3f4f6;
  color: #374151;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #e5e7eb;
  }
`;

export const ModernSecondaryButton = styled.button`
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
