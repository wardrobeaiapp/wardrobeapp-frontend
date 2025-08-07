import { css } from 'styled-components';
import { theme } from './theme';

// Flexbox layouts
export const flexCenter = css`
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const flexBetween = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const flexColumn = css`
  display: flex;
  flex-direction: column;
`;

export const flexColumnCenter = css`
  ${flexColumn}
  align-items: center;
  justify-content: center;
`;

// Typography
export const heading1 = css`
  font-family: ${theme.typography.fontFamily};
  font-size: ${theme.typography.fontSize.xxl};
  font-weight: ${theme.typography.fontWeight.bold};
  line-height: ${theme.typography.lineHeight.tight};
`;

export const heading2 = css`
  font-family: ${theme.typography.fontFamily};
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.bold};
  line-height: ${theme.typography.lineHeight.tight};
`;

export const heading3 = css`
  font-family: ${theme.typography.fontFamily};
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.medium};
  line-height: ${theme.typography.lineHeight.normal};
`;

export const bodyText = css`
  font-family: ${theme.typography.fontFamily};
  font-size: ${theme.typography.fontSize.md};
  font-weight: ${theme.typography.fontWeight.regular};
  line-height: ${theme.typography.lineHeight.normal};
`;

export const smallText = css`
  font-family: ${theme.typography.fontFamily};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.regular};
  line-height: ${theme.typography.lineHeight.normal};
`;

// Common UI patterns
export const card = css`
  background-color: ${theme.colors.white};
  border-radius: ${theme.borderRadius.md};
  box-shadow: ${theme.shadows.sm};
  padding: ${theme.spacing.lg};
`;

export const button = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing.sm} ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.md};
  font-weight: ${theme.typography.fontWeight.medium};
  font-size: ${theme.typography.fontSize.md};
  cursor: pointer;
  transition: all ${theme.transitions.fast};
  border: none;
  outline: none;
  
  &:hover {
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

export const primaryButton = css`
  ${button}
  background-color: ${theme.colors.primary};
  color: ${theme.colors.white};
  
  &:hover {
    background-color: ${theme.colors.primary}dd;
  }
`;

export const secondaryButton = css`
  ${button}
  background-color: ${theme.colors.secondary};
  color: ${theme.colors.white};
  
  &:hover {
    background-color: ${theme.colors.secondary}dd;
  }
`;

export const outlineButton = css`
  ${button}
  background-color: transparent;
  border: 1px solid ${theme.colors.primary};
  color: ${theme.colors.primary};
  
  &:hover {
    background-color: ${theme.colors.primary}11;
  }
`;

// Responsive mixins
export const respondTo = (breakpoint: keyof typeof theme.breakpoints) => {
  return (styles: any) => css`
    @media (min-width: ${theme.breakpoints[breakpoint]}) {
      ${styles}
    }
  `;
};

// Animation mixins
export const fadeIn = css`
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  animation: fadeIn ${theme.transitions.normal};
`;

export const slideUp = css`
  @keyframes slideUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
  animation: slideUp ${theme.transitions.normal};
`;

// Grid layouts
export const grid = (columns: number, gap = theme.spacing.md) => css`
  display: grid;
  grid-template-columns: repeat(${columns}, 1fr);
  gap: ${gap};
`;

export const autoGrid = (minWidth = '250px', gap = theme.spacing.md) => css`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(${minWidth}, 1fr));
  gap: ${gap};
`;
