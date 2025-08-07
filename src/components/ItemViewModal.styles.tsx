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
  max-width: 600px;
  width: 100%;
  background-color: white;
  padding: 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-height: 90vh;
  overflow-y: auto;
`;

export const ItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

export const ItemTitle = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
`;

export const ItemImageContainer = styled.div`
  width: 100%;
  height: 220px;
  margin-bottom: 1rem;
  background-color: #f3f4f6;
  border-radius: 0.5rem;
  overflow: hidden;
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
  margin-bottom: 0.5rem;
`;

export const DetailRow = styled.div`
  display: flex;
  margin-bottom: 0.5rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

export const DetailLabel = styled.div`
  width: 100px;
  font-weight: 500;
  color: #4b5563;
  font-size: 0.9rem;
`;

export const DetailValue = styled.div`
  flex: 1;
  color: #1f2937;
  font-size: 0.9rem;
`;

export const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`;

export const Tag = styled.span`
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  background-color: #e5e7eb;
  color: #4b5563;
  font-size: 0.75rem;
  font-weight: 500;
`;

export const ButtonsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  margin-top: 1.5rem;
`;
