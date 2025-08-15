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

export const OutfitName = styled.h3`
  margin-top: 0;
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
`;

export const OutfitDetail = styled.p`
  margin: 0.25rem 0;
  font-size: 0.9rem;
  color: ${theme.colors.gray[600]};
`;

export const ButtonsContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
`;

export const SeasonTag = styled.span`
  display: inline-block;
  background-color: ${theme.colors.gray[100]};
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
  color: ${theme.colors.primary};
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
