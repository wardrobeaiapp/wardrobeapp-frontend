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
  z-index: 1000;
`;

export const ModalContent = styled.div`
  background-color: white;
  border-radius: 0.5rem;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

export const ModalTitle = styled.h2`
  margin: 0;
  font-size: 1.5rem;
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
  
  &:hover {
    color: #374151;
  }
`;

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

export const SeasonText = styled.span`
  color: #0f172a;
  font-weight: 500;
  font-size: 0.875rem;
  
  @media (min-width: 768px) {
    font-size: 0.9rem;
  }
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

export const SectionTitle = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
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
  background-color: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  font-size: 12px;
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

export const PrimaryButton = styled.button`
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

export const SecondaryButton = styled.button`
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
