import styled from 'styled-components';
import { WishlistStatus } from '../../../../types';
import { theme } from '../../../../styles/theme';
import { Card as BaseCard } from '../../../cards/Card.styles';

export const Card = styled(BaseCard).attrs({ $variant: 'default', $hoverable: true })`
  padding: 0;
  display: flex;
  flex-direction: column;
  border-radius: 0.75rem;
  overflow: hidden;
  position: relative;
  
  &:hover {
    transform: translateY(-4px);
  }
`;

export const ImageContainer = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  overflow: hidden;
`;

export const ItemImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
  
  ${Card}:hover & {
    transform: scale(1.05);
  }
`;

export const PlaceholderImage = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${theme.colors.gray[400]};
  font-size: 1.25rem;
  font-weight: 500;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
`;

export const StatusIcon = styled.div<{ $status: WishlistStatus }>`
  position: absolute;
  top: 12px;
  right: 12px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  color: white;
  background-color: ${props => {
    switch (props.$status) {
      case WishlistStatus.APPROVED:
        return theme.colors.green[500];
      case WishlistStatus.POTENTIAL_ISSUE:
        return theme.colors.warning;
      case WishlistStatus.NOT_REVIEWED:
      default:
        return theme.colors.gray[500];
    }
  }};
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(8px);
  z-index: 10;
  border: 2px solid white;
`;

export const CardContent = styled.div`
  padding: 1rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

export const ItemName = styled.h3`
  margin: 0 0 0.75rem;
  font-size: 1.125rem;
  font-weight: 700;
  color: ${theme.colors.gray[900]};
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

export const ItemDetails = styled.div`
  margin-bottom: 1rem;
  flex: 1;
`;

export const ItemDetail = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  
  span:first-child {
    color: ${theme.colors.gray[500]};
    font-weight: 500;
    min-width: fit-content;
  }
  
  span:last-child {
    color: ${theme.colors.gray[700]};
    font-weight: 600;
    text-align: right;
    text-transform: capitalize;
  }
`;

export const TagsContainer = styled.div<{ $hasButtons?: boolean }>`
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin: ${props => props.$hasButtons ? '0 0 0.75rem' : '0'};
`;

export const Tag = styled.span`
  padding: 0.375rem 0.75rem;
  border-radius: 0.5rem;
  background: linear-gradient(135deg, ${theme.colors.purple[500]} 0%, ${theme.colors.purple[600]} 100%);
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  box-shadow: 0 2px 4px rgba(139, 92, 246, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

export const ButtonContainer = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: auto;
  padding-top: 0.5rem;
`;
