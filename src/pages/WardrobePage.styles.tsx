import styled from 'styled-components';

export const WardrobeContainer = styled.div`
  min-height: 100vh;
  background-color: #f9fafb;
`;

export const WardrobeContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

export const WardrobeHeader = styled.div`
  margin-bottom: 2rem;
`;

export const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
`;

export const Subtitle = styled.p`
  font-size: 1rem;
  color: #6b7280;
  margin: 0;
`;

export const TabsContainer = styled.div`
  margin-bottom: 2rem;
  border-bottom: 1px solid #e5e7eb;
  background: white;
  border-radius: 0.5rem;
  padding: 0.25rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

export const TabsList = styled.div`
  display: flex;
  gap: 0;
`;

export const Tab = styled.button<{ $active?: boolean }>`
  flex: 1;
  padding: 0.75rem 1.5rem;
  background: ${props => props.$active ? '#8B5CF6' : 'transparent'};
  color: ${props => props.$active ? 'white' : '#6B7280'};
  border: none;
  border-radius: 0.5rem 0.5rem 0 0;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.$active ? '#7C3AED' : '#F3F4F6'};
  }
`;

export const FiltersAndSearchContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

export const FiltersGroup = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;
  
  @media (max-width: 768px) {
    justify-content: center;
  }
`;

export const FilterSelect = styled.select`
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

export const SearchContainer = styled.div`
  position: relative;
  flex: 1;
  max-width: 300px;
  
  @media (max-width: 768px) {
    max-width: 100%;
  }
`;

export const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 2.5rem 0.75rem 2.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  background: white;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  
  &:focus {
    outline: none;
    ring: 2px;
    ring-color: #8b5cf6;
    border-color: #8b5cf6;
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
  }
  
  &::placeholder {
    color: #9ca3af;
  }
`;

export const SearchIcon = styled.div`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
`;

export const ActionsContainer = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

export const AddItemButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background-color: #8b5cf6;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(139, 92, 246, 0.2);
  
  &:hover {
    background-color: #7c3aed;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
  }
  
  &:focus {
    outline: none;
    ring: 2px;
    ring-color: #8b5cf6;
    ring-offset: 2px;
  }
`;

export const ItemsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 1rem;
  }
`;

export const ItemCard = styled.div`
  background-color: white;
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #f3f4f6;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    border-color: #e5e7eb;
  }
`;

export const ItemImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 200px;
  background-color: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const ItemImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

export const ItemImagePlaceholder = styled.div`
  color: #9ca3af;
  font-size: 0.875rem;
`;

export const ItemContent = styled.div`
  padding: 1rem;
`;

export const ItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
`;

export const ItemTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  flex: 1;
`;

export const ItemCategory = styled.span`
  font-size: 0.75rem;
  color: #6b7280;
  text-transform: capitalize;
`;

export const ItemMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

export const SeasonTag = styled.span<{ $season?: string }>`
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: capitalize;
  
  ${props => {
    switch (props.$season?.toLowerCase()) {
      case 'spring':
        return `
          background-color: #dcfce7;
          color: #16a34a;
        `;
      case 'summer':
        return `
          background-color: #fef3c7;
          color: #d97706;
        `;
      case 'fall':
      case 'autumn':
        return `
          background-color: #fed7aa;
          color: #ea580c;
        `;
      case 'winter':
        return `
          background-color: #dbeafe;
          color: #2563eb;
        `;
      default:
        return `
          background-color: #f3f4f6;
          color: #6b7280;
        `;
    }
  }}
`;

export const ViewButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  background-color: #8b5cf6;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  &:hover {
    background-color: #7c3aed;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
  }
  
  &:focus {
    outline: none;
    ring: 2px;
    ring-color: #8b5cf6;
    ring-offset: 2px;
  }
`;

export const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: #6b7280;
`;

export const EmptyStateIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
`;

export const EmptyStateTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.5rem 0;
`;

export const EmptyStateDescription = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
`;
