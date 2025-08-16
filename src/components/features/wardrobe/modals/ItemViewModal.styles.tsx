import styled from 'styled-components';

// Removed old modal styles - now using standard Modal component

export const ItemImageContainer = styled.div`
  width: 100%;
  height: 200px;
  margin-bottom: 1.25rem;
  background-color: #f8fafc;
  border-radius: 0.75rem;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  
  @media (min-width: 768px) {
    height: 380px;
    width: 380px;
    margin-bottom: 1.5rem;
    margin-left: auto;
    margin-right: auto;
  }
`;

export const ItemImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

export const PlaceholderImage = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  font-size: 1.5rem;
`;

export const ItemDetails = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem 1.5rem;
  align-items: start;
  
  @media (max-width: 767px) {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
`;

export const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f1f5f9;
  
  &:last-child {
    border-bottom: none;
  }
`;

export const DetailLabel = styled.span`
  font-weight: 600;
  color: #64748b;
  font-size: 0.9rem;
`;

export const DetailValue = styled.span`
  color: #1e293b;
  font-weight: 500;
  text-align: right;
  font-size: 0.9rem;
`;

export const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1rem;
`;

export const Tag = styled.span`
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.025em;
  box-shadow: 0 2px 4px rgba(139, 92, 246, 0.3);
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(139, 92, 246, 0.4);
  }
`;
