import styled from 'styled-components';

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
  padding: 1rem;
  z-index: 60;
`;

export const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 800px;
  width: 100%;
  background-color: white;
  padding: 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-height: 90vh;
  overflow-y: auto;
`;

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
`;

export const ModalTitle = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
`;

export const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  color: #6b7280;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;

  &:hover {
    background-color: #f3f4f6;
    color: #374151;
  }
`;

export const OutfitInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  
  @media (min-width: 768px) {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem 1.5rem;
    align-items: start;
  }
  
  margin-bottom: 1.5rem;
`;

export const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f1f5f9;
  
  &:last-child {
    border-bottom: none;
  }
  
  @media (min-width: 768px) {
    padding: 0.75rem 0;
    border-bottom: none;
  }
`;

export const DetailLabel = styled.span`
  font-weight: 600;
  color: #64748b;
  font-size: 0.875rem;
  
  @media (min-width: 768px) {
    font-size: 0.9rem;
  }
`;

export const DetailValue = styled.span`
  color: #0f172a;
  font-weight: 500;
  font-size: 0.875rem;
  
  @media (min-width: 768px) {
    font-size: 0.9rem;
  }
`;

export const SeasonTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

export const SeasonTag = styled.span`
  background-color: #8b5cf6;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.025em;
  box-shadow: 0 2px 4px rgba(139, 92, 246, 0.3);
`;

export const SeasonText = styled.span`
  color: #0f172a;
  font-weight: 500;
  font-size: 0.875rem;
  
  @media (min-width: 768px) {
    font-size: 0.9rem;
  }
`;

export const ItemsSection = styled.div`
  margin-bottom: 1.5rem;
`;

export const SectionTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 1rem 0;
`;

export const ItemsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
`;

export const ItemCard = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  padding: 0.75rem;
  transition: all 0.2s;
  
  &:hover {
    border-color: #d1d5db;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
`;

export const ItemImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100px;
  background-color: #f3f4f6;
  border-radius: 0.25rem;
  margin-bottom: 0.5rem;
  overflow: hidden;
`;

export const ItemImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

export const PlaceholderImage = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  font-size: 0.75rem;
`;

export const ItemContent = styled.div`
  display: flex;
  flex-direction: column;
`;

export const ItemName = styled.div`
  font-weight: 500;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
`;

export const ItemDetail = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1.25rem;
  padding-top: 1.25rem;
  border-top: 1px solid #e2e8f0;
  
  @media (min-width: 768px) {
    gap: 0.75rem;
    margin-top: 1.5rem;
    padding-top: 1.5rem;
  }
`;

