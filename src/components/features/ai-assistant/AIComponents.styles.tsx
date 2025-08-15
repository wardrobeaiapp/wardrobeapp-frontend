import styled from 'styled-components';

// Form elements
export const FormGroup = styled.div`
  margin-bottom: 20px;
`;

export const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
`;

export const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  &:focus {
    outline: none;
    border-color: #4a90e2;
  }
`;

// Season selector
export const SeasonCheckboxes = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

export const CheckboxItem = styled.div`
  display: flex;
  align-items: center;
`;

export const CheckboxLabel = styled.label`
  margin-left: 8px;
  cursor: pointer;
`;

// Item selection
export const ItemsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 15px;
  margin-top: 15px;
`;

export const ItemCard = styled.div<{ selected: boolean }>`
  border: 1px solid ${(props) => (props.selected ? '#4a90e2' : '#ddd')};
  background-color: ${(props) => (props.selected ? '#e6f0fa' : 'white')};
  border-radius: 4px;
  padding: 10px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: #4a90e2;
  }
`;

export const ItemImage = styled.img`
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 4px;
`;

export const ItemName = styled.p`
  margin: 8px 0 0;
  font-size: 14px;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const SelectedItemsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 15px;
`;

export const SelectedItem = styled.div`
  display: flex;
  align-items: center;
  background-color: #e6f0fa;
  border: 1px solid #4a90e2;
  border-radius: 20px;
  padding: 5px 10px;
`;

export const RemoveButton = styled.button`
  background: none;
  border: none;
  color: #4a90e2;
  cursor: pointer;
  margin-left: 5px;
  font-size: 16px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

// Filters
export const FiltersContainer = styled.div`
  margin-bottom: 20px;
`;

export const FilterGroup = styled.div`
  margin-bottom: 15px;
`;

export const FilterLabel = styled.label`
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
`;

export const FilterSelect = styled.select`
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  &:focus {
    outline: none;
    border-color: #4a90e2;
  }
`;

// Scenario selector
export const ScenarioCheckboxes = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

// Button group
export const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
`;

export const Button = styled.button`
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
`;

// Modal styles
export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

// Items modal specific styles
export const Modal = styled(ModalOverlay)``;

export const ModalContent = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
`;

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

export const ModalTitle = styled.h2`
  margin: 0;
  font-size: 20px;
`;

export const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
  &:hover {
    color: #333;
  }
`;

// Additional components for ItemsModal
export const ResultsCount = styled.div`
  margin-bottom: 15px;
  font-size: 14px;
  color: #666;
`;

export const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
`;

// Additional components for ItemsGrid
export const SelectionIndicator = styled.div`
  position: absolute;
  top: 5px;
  right: 5px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: #4a90e2;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
`;

export const ItemImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 120px;
`;

export const ItemImagePlaceholder = styled.div`
  width: 100%;
  height: 120px;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  color: #999;
`;

export const ItemDetails = styled.div`
  font-size: 12px;
  color: #666;
  margin-top: 4px;
`;

export const NoResultsMessage = styled.div`
  text-align: center;
  padding: 20px;
  color: #666;
`;
