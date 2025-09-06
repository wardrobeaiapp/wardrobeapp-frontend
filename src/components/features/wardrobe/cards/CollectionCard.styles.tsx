import styled from 'styled-components';
import { theme } from '../../../../styles/theme';
import { Card as BaseCard } from '../../../cards/Card.styles';

export const Card = styled(BaseCard).attrs({ $variant: 'default', $padding: 'lg', $hoverable: true })`
  display: flex;
  flex-direction: column;
  border-radius: 0.75rem;
  position: relative;
  
  &:hover {
    transform: translateY(-4px);
  }
`;

export const CollectionName = styled.h3`
  margin: 0 0 0.75rem;
  font-size: 1.1rem;
  font-weight: ${theme.typography.fontWeight.semiBold};
  color: ${theme.colors.text};
  height: 2.7rem; /* Fixed height to accommodate up to 2 lines */
  display: -webkit-box;
  -webkit-line-clamp: 2; /* Limit to 2 lines */
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.35;
`;

export const CollectionDetail = styled.p`
  margin: 0.25rem 0;
  font-size: 0.9rem;
  color: ${theme.colors.gray[600]};
`;

export const DescriptionText = styled.p`
  margin: 0.5rem 0;
  font-size: 0.875rem;
  color: ${theme.colors.gray[600]};
  line-height: 1.4;
`;

export const ButtonsContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
`;

export const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin: 0 0 0.75rem;
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
  background-color: ${theme.colors.background};
  border: 1px solid ${theme.colors.gray[200]};
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
  background-color: ${theme.colors.gray[100]};
  color: ${theme.colors.gray[500]};
  font-size: 0.875rem;
  font-weight: ${theme.typography.fontWeight.semiBold};
`;
