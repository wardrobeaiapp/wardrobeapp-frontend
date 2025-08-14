import styled from 'styled-components';

export const Card = styled.div`
  display: flex;
  flex-direction: column;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1);
  background-color: white;
  border: 1px solid #f3f4f6;
  transition: all 0.3s ease;
  padding: 1.25rem;
  position: relative;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
    border-color: #e5e7eb;
  }
`;

export const OutfitName = styled.h3`
  margin-top: 0;
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
`;

export const OutfitDetail = styled.p`
  margin: 0.25rem 0;
  font-size: 0.9rem;
  color: #4b5563;
`;

export const ButtonsContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
`;

export const ActionButton = styled.button`
  background: none;
  border: 1px solid #e5e7eb;
  border-radius: 0.25rem;
  padding: 0.25rem 0.5rem;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #f3f4f6;
  }
`;

export const EditButton = styled.button`
  flex: 1;
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(139, 92, 246, 0.3);
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(139, 92, 246, 0.4);
    background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(139, 92, 246, 0.3);
  }
`;

export const DeleteButton = styled(ActionButton)`
  color: #dc2626;
  border-color: #dc2626;

  &:hover {
    background-color: #fee2e2;
  }
`;

export const SeasonTag = styled.span`
  display: inline-block;
  background-color: #f3f4f6;
  border-radius: 9999px;
  padding: 0.2rem 0.5rem;
  font-size: 0.75rem;
  margin-right: 0.25rem;
`;

export const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 0.5rem;
`;

export const OccasionTag = styled(SeasonTag)`
  background-color: #eef2ff;
  color: #4f46e5;
`;

export const ItemImagesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
  margin: 1rem 0;
`;

export const ItemImageSquare = styled.div`
  aspect-ratio: 1;
  border-radius: 0.5rem;
  overflow: hidden;
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  position: relative;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export const ItemImagePlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f3f4f6;
  color: #9ca3af;
  font-size: 0.875rem;
  font-weight: 600;
`;
