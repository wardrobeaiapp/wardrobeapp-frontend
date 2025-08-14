import styled, { css } from 'styled-components';
import { theme } from '../../styles/theme';

// Card variant types
export type CardVariant = 'default' | 'elevated' | 'outline' | 'flat' | 'minimal';
export type CardSize = 'sm' | 'md' | 'lg' | 'xl';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg' | 'xl';

interface CardProps {
  $variant?: CardVariant;
  $size?: CardSize;
  $padding?: CardPadding;
  $hoverable?: boolean;
  $interactive?: boolean;
  $selected?: boolean;
}

// Base card styles
const baseCardStyles = css`
  display: flex;
  flex-direction: column;
  background-color: white;
  border-radius: ${theme.borderRadius.lg};
  transition: ${theme.transitions.normal};
  position: relative;
`;

// Variant styles
const variantStyles = {
  default: css`
    border: 1px solid ${theme.colors.gray[200]};
    box-shadow: ${theme.shadows.sm};
  `,
  elevated: css`
    border: 1px solid ${theme.colors.gray[100]};
    box-shadow: ${theme.shadows.md};
  `,
  outline: css`
    border: 1px solid ${theme.colors.gray[300]};
    box-shadow: none;
  `,
  flat: css`
    border: none;
    box-shadow: none;
    background-color: ${theme.colors.gray[50]};
  `,
  minimal: css`
    border: none;
    box-shadow: none;
    background-color: transparent;
  `
};

// Size styles (mainly affects border-radius and overall scale)
const sizeStyles = {
  sm: css`
    border-radius: ${theme.borderRadius.md};
  `,
  md: css`
    border-radius: ${theme.borderRadius.lg};
  `,
  lg: css`
    border-radius: ${theme.borderRadius.lg};
  `,
  xl: css`
    border-radius: ${theme.borderRadius.lg};
  `
};

// Padding styles
const paddingStyles = {
  none: css`
    padding: 0;
  `,
  sm: css`
    padding: ${theme.spacing.sm};
  `,
  md: css`
    padding: ${theme.spacing.md};
  `,
  lg: css`
    padding: ${theme.spacing.lg};
  `,
  xl: css`
    padding: ${theme.spacing.xl};
  `
};

// Hover styles
const hoverStyles = css`
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.lg};
    border-color: ${theme.colors.gray[300]};
  }
`;

// Interactive styles (for clickable cards)
const interactiveStyles = css`
  cursor: pointer;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: ${theme.shadows.xl};
    border-color: ${theme.colors.purple[200]};
  }
  
  &:active {
    transform: translateY(-1px);
    box-shadow: ${theme.shadows.md};
  }
`;

// Selected styles
const selectedStyles = css`
  border-color: ${theme.colors.purple[300]};
  box-shadow: 0 0 0 2px ${theme.colors.purple[100]};
  background-color: ${theme.colors.purple[50]};
`;

// Main Card component
export const Card = styled.div<CardProps>`
  ${baseCardStyles}
  
  ${({ $variant = 'default' }) => variantStyles[$variant]}
  ${({ $size = 'md' }) => sizeStyles[$size]}
  ${({ $padding = 'md' }) => paddingStyles[$padding]}
  
  ${({ $hoverable }) => $hoverable && hoverStyles}
  ${({ $interactive }) => $interactive && interactiveStyles}
  ${({ $selected }) => $selected && selectedStyles}
`;

// Card content sections
export const CardHeader = styled.div`
  padding-bottom: ${theme.spacing.sm};
  border-bottom: 1px solid ${theme.colors.gray[100]};
  margin-bottom: ${theme.spacing.md};
  
  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
  }
`;

export const CardBody = styled.div`
  flex: 1;
`;

export const CardFooter = styled.div`
  padding-top: ${theme.spacing.sm};
  border-top: 1px solid ${theme.colors.gray[100]};
  margin-top: ${theme.spacing.md};
  
  &:first-child {
    border-top: none;
    margin-top: 0;
  }
`;

// Specialized card variants for common use cases
export const ItemCard = styled(Card).attrs({ $variant: 'elevated', $interactive: true })`
  overflow: hidden;
`;

export const FeatureCard = styled(Card).attrs({ $variant: 'default', $padding: 'xl' })`
  text-align: center;
`;

export const AuthCard = styled(Card).attrs({ $variant: 'elevated', $padding: 'xl', $size: 'lg' })`
  width: 100%;
  max-width: 450px;
  text-align: center;
`;

export const StatCard = styled(Card).attrs({ $variant: 'default', $padding: 'lg' })`
  text-align: center;
`;

export const ProgressCard = styled(Card).attrs({ $variant: 'outline', $padding: 'lg' })`
  border-color: ${theme.colors.purple[200]};
  background: linear-gradient(135deg, ${theme.colors.purple[50]} 0%, white 100%);
`;

// Card content helpers
export const CardTitle = styled.h3`
  margin: 0 0 ${theme.spacing.sm} 0;
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.gray[900]};
`;

export const CardSubtitle = styled.h4`
  margin: 0 0 ${theme.spacing.xs} 0;
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.gray[600]};
`;

export const CardText = styled.p`
  margin: 0;
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.gray[700]};
  line-height: ${theme.typography.lineHeight.loose};
`;

export const CardImage = styled.div`
  width: 100%;
  aspect-ratio: 1;
  background: linear-gradient(135deg, ${theme.colors.gray[50]} 0%, ${theme.colors.gray[100]} 100%);
  overflow: hidden;
  border-radius: ${theme.borderRadius.md};
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;
