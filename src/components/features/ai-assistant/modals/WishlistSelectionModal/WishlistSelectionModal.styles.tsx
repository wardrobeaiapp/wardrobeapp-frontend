import styled from 'styled-components';

export const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 2rem;
  color: #6b7280;
  font-size: 1rem;
  line-height: 1.5;
  
  p {
    margin: 0.5rem 0;
  }
`;

// Search and Filter Styles
export const FilterSection = styled.div`
  padding-bottom: 1.5rem;
  
  @media (max-width: 480px) {
    padding-bottom: 0;
  }
`;

export const SearchContainer = styled.div`
  position: relative;
  margin-bottom: 1rem;

  svg {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: #6b7280;
    font-size: 1rem;
    pointer-events: none;
  }
`;

export const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 2.5rem 0.75rem 2.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 400;
  color: #374151;
  background: white;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #d1d5db;
  }
  
  &:focus {
    outline: none;
    border-color: #8b5cf6;
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

export const FilterRow = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  align-items: center;
`;

export const FilterGroup = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 140px;
`;

export const FilterLabel = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  font-size: 0.875rem;
  color: #374151;
`;

export const FilterSelect = styled.select`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  background-color: white;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  min-width: 140px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  
  &:focus {
    outline: none;
    ring: 2px;
    ring-color: #8b5cf6;
    border-color: #8b5cf6;
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
  }
`;

export const FilterInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
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
    border-color: #8b5cf6;
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
  }
`;

export const ItemsFoundText = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
  margin-top: 1rem;
  
  @media (max-width: 768px) {
    margin-top: 0.5rem;
    text-align: center;
  }
`;
