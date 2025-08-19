import React, { SelectHTMLAttributes, forwardRef } from 'react';
import styled, { css } from 'styled-components';
import { Theme } from '../../../theme/types';

type SelectSize = 'small' | 'medium' | 'large';
type SelectVariant = 'outline' | 'filled' | 'flushed';

// Extend SelectHTMLAttributes but omit 'size' to avoid conflict with our size prop
type OmittedSelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'>;

export interface FormSelectProps extends OmittedSelectProps {
  /**
   * Size of the select
   * @default 'medium'
   */
  size?: SelectSize;
  /**
   * Visual style variant
   * @default 'outline'
   */
  variant?: SelectVariant;
  /**
   * Whether the select is invalid
   */
  isInvalid?: boolean;
  /**
   * Whether the select is disabled
   */
  isDisabled?: boolean;
  /**
   * Whether the select should take up the full width of its container
   */
  isFullWidth?: boolean;
  /**
   * Left icon element
   */
  leftIcon?: React.ReactNode;
  /**
   * Right icon element (replaces the default dropdown icon)
   */
  rightIcon?: React.ReactNode;
  /**
   * Additional class name
   */
  className?: string;
}

interface StyledSelectProps {
  $size: SelectSize;
  $variant: SelectVariant;
  $isInvalid?: boolean;
  $hasLeftIcon: boolean;
  $hasRightIcon: boolean;
  $isFullWidth?: boolean;
}

const getSizeStyles = (theme: Theme) => ({
  small: css`
    height: 2rem;
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
    line-height: 1.25rem;
    padding-right: 2rem;
  `,
  medium: css`
    height: 2.7rem;
    padding: 0.75rem;
    font-size: 0.875rem;
    line-height: 1rem;
    padding-right: 2.5rem;
  `,
  large: css`
    height: 3rem;
    padding: 0.75rem 1rem;
    font-size: 1rem;
    line-height: 1.5rem;
    padding-right: 2.5rem;
  `,
});

const getVariantStyles = (theme: Theme) => ({
  outline: css`
    background-color: ${theme.colors.background};
    border: 1px solid ${theme.colors.borderDark};
    border-radius: 0.375rem;
    
    &:focus {
      outline: none;
      border-color: ${theme.colors.primary};
      box-shadow: 0 0 0 1px ${theme.colors.primary};
    }
    
    &::placeholder {
      color: ${theme.colors.gray400};
    }
  `,
  filled: css`
    background-color: ${theme.colors.gray100};
    border: 1px solid transparent;
    border-radius: 0.375rem;
    
    &:hover {
      background-color: ${theme.colors.gray200};
    }
    
    &:focus {
      background-color: ${theme.colors.background};
      border-color: ${theme.colors.primary};
      box-shadow: 0 0 0 1px ${theme.colors.primary};
    }
  `,
  flushed: css`
    background-color: transparent;
    border: none;
    border-bottom: 1px solid ${theme.colors.border};
    border-radius: 0;
    padding-left: 0;
    
    &:focus {
      outline: none;
      border-color: ${theme.colors.primary};
      box-shadow: 0 1px 0 0 ${theme.colors.primary};
    }
  `,
});

const SelectContainer = styled.div<{ $isFullWidth?: boolean }>`
  position: relative;
  display: inline-flex;
  align-items: center;
  width: ${({ $isFullWidth }) => ($isFullWidth ? '100%' : 'auto')};
`;

const StyledSelect = styled.select<StyledSelectProps>`
  ${({ theme, $size = 'medium', $variant = 'outline', $isInvalid, $hasLeftIcon, $hasRightIcon }) => css`
    ${getSizeStyles(theme)[$size]}
    ${getVariantStyles(theme)[$variant]}
    
    width: 100%;
    appearance: none;
    transition: all 0.2s ease;
    color: ${theme.colors.textPrimary};
    background-color: ${$variant === 'filled' ? theme.colors.gray100 : theme.colors.background};
    
    ${$hasLeftIcon && 'padding-left: 2.5rem;'}
    ${$hasRightIcon && 'padding-right: 2.5rem;'}
    
    ${$isInvalid && `
      border-color: ${theme.colors.danger};
      box-shadow: 0 0 0 1px ${theme.colors.danger};
    `}
    
    &:disabled {
      background-color: ${theme.colors.gray100};
      cursor: not-allowed;
      opacity: 0.7;
    }
    
    &::placeholder {
      color: ${theme.colors.gray400};
    }
  `}
  
  /* Default dropdown icon (only shown when no right icon is provided) */
  ${({ $hasRightIcon }) => !$hasRightIcon && css`
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0.75rem center;
    background-size: 1rem;
  `}
`;

const IconWrapper = styled.div<{ $position: 'left' | 'right' }>`
  position: absolute;
  ${({ $position }) => $position === 'left' ? 'left: 0.75rem;' : 'right: 0.75rem;'}
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  color: ${({ theme }) => theme.colors.gray400};
`;

export const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  ({
    size = 'medium',
    variant = 'outline',
    isInvalid = false,
    isDisabled = false,
    isFullWidth = true,
    leftIcon,
    rightIcon,
    className,
    style,
    children,
    id,
    ...props
  }, ref) => {
    const hasLeftIcon = Boolean(leftIcon);
    const hasRightIcon = Boolean(rightIcon);

    return (
      <SelectContainer $isFullWidth={isFullWidth}>
        {leftIcon && <IconWrapper $position="left">{leftIcon}</IconWrapper>}
        <StyledSelect
          ref={ref}
          id={id}
          $size={size}
          $variant={variant}
          $isInvalid={isInvalid}
          $hasLeftIcon={hasLeftIcon}
          $hasRightIcon={hasRightIcon}
          $isFullWidth={isFullWidth}
          disabled={isDisabled}
          aria-invalid={isInvalid}
          aria-disabled={isDisabled}
          className={className}
          style={style}
          {...props}
        >
          {children}
        </StyledSelect>
        {rightIcon && <IconWrapper $position="right">{rightIcon}</IconWrapper>}
      </SelectContainer>
    );
  }
);

FormSelect.displayName = 'FormSelect';
