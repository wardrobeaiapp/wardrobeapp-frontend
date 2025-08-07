import styled from 'styled-components';
import { theme, heading3, smallText } from '../../styles';

export const Card = styled.div<{ $active: boolean }>`
  background-color: ${props => props.$active ? `${theme.colors.primary}11` : theme.colors.gray[100]};
  border: 2px solid ${props => props.$active ? theme.colors.primary : theme.colors.gray[300]};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.lg};
  cursor: pointer;
  transition: all ${theme.transitions.fast};
  
  &:hover {
    border-color: ${theme.colors.primary};
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.sm};
  }
`;

export const Title = styled.h3`
  ${heading3}
  color: ${theme.colors.text};
  margin: 0 0 ${theme.spacing.xs};
`;

export const Description = styled.p`
  ${smallText}
  color: ${theme.colors.lightText};
  margin: 0;
`;
