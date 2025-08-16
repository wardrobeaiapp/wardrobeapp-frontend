import styled from 'styled-components';

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
  text-align: right;
  
  @media (min-width: 768px) {
    font-size: 0.9rem;
  }
`;

export const SeasonText = styled(DetailValue)`
  /* Inherits styles from DetailValue */
`;

export const SectionTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 1rem 0;
`;

export const ItemCard = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 0.75rem;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  
  &:hover {
    border-color: #d1d5db;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
`;

export const ItemImageContainer = styled.div`
  position: relative;
  width: 360px;
  height: 360px;
  margin: 0 auto 1rem;
  aspect-ratio: 1;
  flex-shrink: 0;
  background-color: #f3f4f6;
  border-radius: 0.375rem;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const ItemImage = styled.img`
  max-width: 100%;
  width: 100%;
  max-height: 100%;
  object-fit: cover;
  border-radius: 0.375rem;
`;

export const PlaceholderImage = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8fafc;
  color: #9ca3af;
  font-size: 0.75rem;
`;

export const ItemContent = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

export const ItemName = styled.div`
  font-weight: 500;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
`;

export const ItemDetail = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
  word-break: break-word;
  white-space: normal;
`;

export const ItemsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 1rem;
`;
