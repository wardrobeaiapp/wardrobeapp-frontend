import styled from 'styled-components';

export const CapsuleInfo = styled.div`
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

export const ItemsSection = styled.div`
  margin-top: 1.5rem;
`;

export const MainItemSection = styled.div`
  margin-top: 1.5rem;
`;

export const MainItemCard = styled.div`
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border: 2px solid #8b5cf6;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.1);
  margin-bottom: 0.5rem;
  position: relative;
  
  &::before {
    content: '★';
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    color: #8b5cf6;
    font-size: 18px;
    font-weight: bold;
  }
  
  @media (max-width: 640px) {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
`;

export const MainItemImageContainer = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  
  @media (max-width: 640px) {
    width: 100px;
    height: 100px;
  }
`;

export const MainItemImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

export const MainItemContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.25rem;
`;

export const MainItemName = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
`;

export const MainItemDetail = styled.p`
  font-size: 14px;
  color: #64748b;
  margin: 0;
`;

export const MainItemBadge = styled.span`
  display: inline-block;
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
  font-size: 12px;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  margin-top: 0.25rem;
  align-self: flex-start;
`;

export const MainItemPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  background-color: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8b5cf6;
  font-size: 12px;
  font-weight: 500;
`;

// Using shared ItemContent, ItemName, and ItemDetail from modalCommon.styles
