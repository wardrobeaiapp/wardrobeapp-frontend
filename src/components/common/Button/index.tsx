import React from 'react';
import styled from 'styled-components';
import { theme } from '../../../styles/theme';

// Comprehensive button variants and sizes
export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' | 'ghost' | 'link';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  outlined?: boolean;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
  'data-testid'?: string;
}

// Styled component props (using $ prefix to avoid DOM warnings)
interface StyledButtonProps {
  $variant: ButtonVariant;
  $size: ButtonSize;
  $outlined: boolean;
  $disabled: boolean;
  $loading: boolean;
  $fullWidth: boolean;
}

const StyledButton = styled.button<StyledButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.xs};
  font-family: ${theme.typography.fontFamily};
  font-weight: ${theme.typography.fontWeight.medium};
  border-radius: ${theme.borderRadius.md};
  cursor: pointer;
  transition: ${theme.transitions.fast};
  border: 1px solid transparent;
  text-decoration: none;
  white-space: nowrap;
  
  /* Size variants */
  ${props => {
    switch (props.$size) {
      case 'xs':
        return `
          padding: 2px ${theme.spacing.xs};
          font-size: ${theme.typography.fontSize.xs};
          min-height: 24px;
        `;
      case 'sm':
        return `
          padding: ${theme.spacing.xs} ${theme.spacing.sm};
          font-size: ${theme.typography.fontSize.sm};
          min-height: 32px;
        `;
      case 'md':
        return `
          padding: ${theme.spacing.sm} ${theme.spacing.md};
          font-size: ${theme.typography.fontSize.md};
          min-height: 40px;
        `;
      case 'lg':
        return `
          padding: ${theme.spacing.sm} ${theme.spacing.lg};
          font-size: ${theme.typography.fontSize.lg};
          min-height: 48px;
        `;
      case 'xl':
        return `
          padding: ${theme.spacing.md} ${theme.spacing.xl};
          font-size: ${theme.typography.fontSize.xl};
          min-height: 56px;
        `;
      default:
        return `
          padding: ${theme.spacing.sm} ${theme.spacing.md};
          font-size: ${theme.typography.fontSize.md};
          min-height: 40px;
        `;
    }
  }}
  
  /* Full width */
  ${props => props.$fullWidth && 'width: 100%;'}
  
  /* Loading state */
  ${props => props.$loading && `
    opacity: 0.7;
    cursor: not-allowed;
    pointer-events: none;
  `}
  
  /* Variant styles */
  ${props => {
    const variant = props.$variant;
    const outlined = props.$outlined;
    
    // Primary variant
    if (variant === 'primary') {
      if (outlined) {
        return `
          background-color: transparent;
          color: ${theme.colors.primary};
          border-color: ${theme.colors.primary};
          
          &:hover:not(:disabled) {
            background-color: ${theme.colors.purple[50]};
          }
          
          &:active:not(:disabled) {
            background-color: ${theme.colors.purple[100]};
          }
        `;
      } else {
        return `
          background-color: ${theme.colors.primary};
          color: ${theme.colors.white};
          border-color: ${theme.colors.primary};
          
          &:hover:not(:disabled) {
            background-color: ${theme.colors.primaryHover};
            border-color: ${theme.colors.primaryHover};
          }
          
          &:active:not(:disabled) {
            background-color: ${theme.colors.primaryActive};
            border-color: ${theme.colors.primaryActive};
          }
        `;
      }
    }
    
    // Secondary variant
    if (variant === 'secondary') {
      if (outlined) {
        return `
          background-color: transparent;
          color: ${theme.colors.gray[700]};
          border-color: ${theme.colors.gray[300]};
          
          &:hover:not(:disabled) {
            background-color: ${theme.colors.gray[50]};
            border-color: ${theme.colors.gray[400]};
          }
          
          &:active:not(:disabled) {
            background-color: ${theme.colors.gray[100]};
          }
        `;
      } else {
        return `
          background-color: ${theme.colors.gray[100]};
          color: ${theme.colors.gray[700]};
          border-color: ${theme.colors.gray[200]};
          
          &:hover:not(:disabled) {
            background-color: ${theme.colors.gray[200]};
            border-color: ${theme.colors.gray[300]};
          }
          
          &:active:not(:disabled) {
            background-color: ${theme.colors.gray[300]};
          }
        `;
      }
    }
    
    // Success variant
    if (variant === 'success') {
      if (outlined) {
        return `
          background-color: transparent;
          color: ${theme.colors.success};
          border-color: ${theme.colors.success};
          
          &:hover:not(:disabled) {
            background-color: ${theme.colors.green[50]};
          }
          
          &:active:not(:disabled) {
            background-color: ${theme.colors.green[100]};
          }
        `;
      } else {
        return `
          background-color: ${theme.colors.success};
          color: ${theme.colors.white};
          border-color: ${theme.colors.success};
          
          &:hover:not(:disabled) {
            background-color: ${theme.colors.green[600]};
            border-color: ${theme.colors.green[600]};
          }
          
          &:active:not(:disabled) {
            background-color: ${theme.colors.green[700]};
          }
        `;
      }
    }
    
    // Error variant
    if (variant === 'error') {
      if (outlined) {
        return `
          background-color: transparent;
          color: ${theme.colors.error};
          border-color: ${theme.colors.error};
          
          &:hover:not(:disabled) {
            background-color: #fef2f2;
          }
          
          &:active:not(:disabled) {
            background-color: #fee2e2;
          }
        `;
      } else {
        return `
          background-color: ${theme.colors.error};
          color: ${theme.colors.white};
          border-color: ${theme.colors.error};
          
          &:hover:not(:disabled) {
            background-color: #dc2626;
            border-color: #dc2626;
          }
          
          &:active:not(:disabled) {
            background-color: #b91c1c;
          }
        `;
      }
    }
    
    // Warning variant
    if (variant === 'warning') {
      if (outlined) {
        return `
          background-color: transparent;
          color: ${theme.colors.warning};
          border-color: ${theme.colors.warning};
          
          &:hover:not(:disabled) {
            background-color: #fffbeb;
          }
          
          &:active:not(:disabled) {
            background-color: #fef3c7;
          }
        `;
      } else {
        return `
          background-color: ${theme.colors.warning};
          color: ${theme.colors.white};
          border-color: ${theme.colors.warning};
          
          &:hover:not(:disabled) {
            background-color: #d97706;
            border-color: #d97706;
          }
          
          &:active:not(:disabled) {
            background-color: #b45309;
          }
        `;
      }
    }
    
    // Info variant
    if (variant === 'info') {
      if (outlined) {
        return `
          background-color: transparent;
          color: ${theme.colors.info};
          border-color: ${theme.colors.info};
          
          &:hover:not(:disabled) {
            background-color: ${theme.colors.blue[50]};
          }
          
          &:active:not(:disabled) {
            background-color: ${theme.colors.blue[100]};
          }
        `;
      } else {
        return `
          background-color: ${theme.colors.info};
          color: ${theme.colors.white};
          border-color: ${theme.colors.info};
          
          &:hover:not(:disabled) {
            background-color: ${theme.colors.blue[600]};
            border-color: ${theme.colors.blue[600]};
          }
          
          &:active:not(:disabled) {
            background-color: ${theme.colors.blue[700]};
          }
        `;
      }
    }
    
    // Ghost variant
    if (variant === 'ghost') {
      return `
        background-color: transparent;
        color: ${theme.colors.gray[700]};
        border-color: transparent;
        
        &:hover:not(:disabled) {
          background-color: ${theme.colors.gray[100]};
        }
        
        &:active:not(:disabled) {
          background-color: ${theme.colors.gray[200]};
        }
      `;
    }
    
    // Link variant
    if (variant === 'link') {
      return `
        background-color: transparent;
        color: ${theme.colors.primary};
        border-color: transparent;
        text-decoration: underline;
        min-height: auto;
        padding: 0;
        
        &:hover:not(:disabled) {
          color: ${theme.colors.primaryHover};
          text-decoration: none;
        }
        
        &:active:not(:disabled) {
          color: ${theme.colors.primaryActive};
        }
      `;
    }
    
    // Default fallback
    return `
      background-color: ${theme.colors.gray[100]};
      color: ${theme.colors.gray[700]};
      border-color: ${theme.colors.gray[200]};
      
      &:hover:not(:disabled) {
        background-color: ${theme.colors.gray[200]};
      }
    `;
  }}
  
  /* Disabled state */
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }
  
  /* Focus styles */
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px ${theme.colors.purple[100]};
  }
`;

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  outlined = false,
  disabled = false,
  loading = false,
  fullWidth = false,
  onClick,
  type = 'button',
  children,
  style,
  className,
  'data-testid': dataTestId,
  ...rest
}) => {
  const handleClick = () => {
    if (!disabled && !loading && onClick) {
      onClick();
    }
  };

  return (
    <StyledButton
      $variant={variant}
      $size={size}
      $outlined={outlined}
      $disabled={disabled}
      $loading={loading}
      $fullWidth={fullWidth}
      onClick={handleClick}
      type={type}
      disabled={disabled || loading}
      style={style}
      className={className}
      data-testid={dataTestId}
      {...rest}
    >
      {loading ? 'Loading...' : children}
    </StyledButton>
  );
};

export default Button;
