import styled from 'styled-components';
import { theme } from '../../../../styles/theme';
import { Card as BaseCard } from '../../../cards/Card.styles';

export const Card = styled(BaseCard).attrs({ $variant: 'outline', $padding: 'lg', $interactive: true })<{ $active: boolean }>`
  background-color: ${props => props.$active ? `${theme.colors.purple[500]}11` : theme.colors.gray[50]};
  border: 2px solid ${props => props.$active ? theme.colors.purple[500] : theme.colors.gray[200]};
  cursor: pointer;
  
  &:hover {
    border-color: ${theme.colors.purple[500]};
    box-shadow: 0 4px 12px ${theme.colors.purple[500]}26;
  }
`;

export const Title = styled.h3`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.gray[900]};
  margin: 0 0 0.5rem;
`;

export const Description = styled.p`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.gray[500]};
  margin: 0;
  line-height: ${theme.typography.lineHeight.normal};
`;
