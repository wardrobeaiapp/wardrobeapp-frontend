import React, { InputHTMLAttributes, forwardRef } from 'react';
import styled, { css } from 'styled-components';
import { Theme } from '../../../theme/types';

type InputSize = 'small' | 'medium' | 'large';
type InputVariant = 'default' | 'outline' | 'filled' | 'flushed';

// Extend InputHTMLAttributes but omit 'size' to avoid conflict with our size prop
type OmittedInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>;

export interface FormInputProps extends OmittedInputProps {
  /**
   * Size of the input
   * @default 'medium'
   */
  size?: InputSize;
  /**
   * Visual style variant
   * @default 'default'
   */
  variant?: InputVariant;
  /**
   * Whether the input is invalid
   */
  isInvalid?: boolean;
  /**
   * Whether the input is disabled
   */
  isDisabled?: boolean;
  /**
   * Whether the input is read-only
   */
  isReadOnly?: boolean;
  /**
   * Whether the input should take up the full width of its container
   */
  isFullWidth?: boolean;
  /**
   * Left icon element
   */
  leftIcon?: React.ReactNode;
  /**
   * Right icon element
   */
  rightIcon?: React.ReactNode;
  /**
   * Additional class name
   */
  className?: string;
}

interface StyledInputProps {
  $size: InputSize;
  $variant: InputVariant;
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
  `,
  medium: css`
    height: 2.7rem;
    padding: 0.75rem;
    font-size: 0.875rem;
    line-height: 1.5rem;
  `,
  large: css`
    height: 3rem;
    padding: 0.75rem 1rem;
    font-size: 1rem;
    line-height: 1.5rem;
  `,
});

const getVariantStyles = (theme: Theme) => ({
  default: css`
    background-color: ${theme.colors.background};
    border: 1px solid ${theme.colors.border};
    border-radius: 0.375rem;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
    width: 100%;
    color: ${theme.colors.textPrimary};
    
    &:focus {
      outline: none;
      border-color: ${theme.colors.primary};
      box-shadow: 0 0 0 1px ${theme.colors.primary};
    }
    
    &::placeholder {
      color: ${theme.colors.gray400};
    }
    
    &:disabled {
      background-color: ${theme.colors.gray200};
      cursor: not-allowed;
      opacity: 0.7;
    }
  `,
  outline: css`
    background-color: ${theme.colors.background};
    border: 1px solid ${theme.colors.borderDark};
    border-radius: 0.375rem;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
    width: 100%;
    color: ${theme.colors.textPrimary};
    
    &:focus {
      outline: none;
      border-color: ${theme.colors.primary};
      box-shadow: 0 0 0 1px ${theme.colors.primary};
    }
    
    &::placeholder {
      color: ${theme.colors.gray400};
    }
    
    &:disabled {
      background-color: ${theme.colors.gray200};
      cursor: not-allowed;
      opacity: 0.7;
    }
  `,
  filled: css`
    background-color: ${theme.colors.gray100};
    border: 1px solid ${theme.colors.border};
    border-radius: 0.375rem;
    transition: background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
    width: 100%;
    color: ${theme.colors.textPrimary};
    
    &:focus {
      background-color: ${theme.colors.background};
      outline: none;
      border-color: ${theme.colors.primary};
      box-shadow: 0 0 0 1px ${theme.colors.primary};
    }
    
    &:disabled {
      background-color: ${theme.colors.gray200};
      cursor: not-allowed;
      opacity: 0.7;
    }
  `,
  flushed: css`
    background-color: transparent;
    border: none;
    border-bottom: 1px solid ${theme.colors.border};
    border-radius: 0;
    padding-left: 0;
    padding-right: 0;
    &:focus {
      border-color: ${theme.colors.primary};
      box-shadow: 0 1px 0 0 ${theme.colors.primary};
    }
  `,
});

const InputContainer = styled.div<{ $isFullWidth?: boolean }>`
  position: relative;
  display: inline-flex;
  align-items: center;
  width: ${({ $isFullWidth }) => ($isFullWidth ? '100%' : 'auto')};
`;

const StyledInput = styled.input<StyledInputProps>`
  width: 100%;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.textPrimary};
  transition: all 0.2s ease;
  outline: none;
  font-family: inherit;
  line-height: 1.5;
  
  /* Size styles */
  ${({ $size, theme }) => getSizeStyles(theme)[$size]}
  
  /* Variant styles */
  ${({ $variant, theme }) => getVariantStyles(theme)[$variant]}
  
  /* Left/right padding for icons */
  ${({ $hasLeftIcon }) => $hasLeftIcon && 'padding-left: 2.5rem;'}
  ${({ $hasRightIcon }) => $hasRightIcon && 'padding-right: 2.5rem;'}
  
  /* Invalid state */
  ${({ $isInvalid, theme }) =>
    $isInvalid &&
    css`
      border-color: ${theme.colors.danger};
      &:focus {
        border-color: ${theme.colors.danger};
        box-shadow: 0 0 0 1px ${theme.colors.danger};
      }
    `}
  
  /* Disabled state */
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  /* Read-only state */
  &:read-only {
    background-color: ${({ theme }) => theme.colors.backgroundSecondary};
    cursor: default;
  }
  
  /* Placeholder text */
  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
    opacity: 1;
  }
`;

const IconWrapper = styled.span<{ $position: 'left' | 'right' }>`
  position: absolute;
  ${({ $position }) => ($position === 'left' ? 'left: 0.75rem;' : 'right: 0.75rem;')}
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  pointer-events: none;
  height: 100%;
`;

/**
 * A customizable input component that supports various sizes, variants, and states.
 * Can be used with or without icons and integrates with FormField for labels and error messages.
 */
const FormInput = forwardRef<HTMLInputElement, FormInputProps>((
  {
    size = 'medium',
    variant = 'default',
    isInvalid = false,
    isDisabled = false,
    isReadOnly = false,
    isFullWidth = false,
    leftIcon,
    rightIcon,
    className,
    ...props
  },
  ref
) => {
  const hasLeftIcon = Boolean(leftIcon);
  const hasRightIcon = Boolean(rightIcon);

  return (
    <InputContainer className={className} $isFullWidth={isFullWidth}>
      {leftIcon && <IconWrapper $position="left">{leftIcon}</IconWrapper>}
      <StyledInput
        ref={ref}
        $size={size}
        $variant={variant}
        $isInvalid={isInvalid}
        $hasLeftIcon={hasLeftIcon}
        $hasRightIcon={hasRightIcon}
        $isFullWidth={isFullWidth}
        disabled={isDisabled || isReadOnly}
        readOnly={isReadOnly}
        aria-invalid={isInvalid}
        {...props}
      />
      {rightIcon && <IconWrapper $position="right">{rightIcon}</IconWrapper>}
    </InputContainer>
  );
});

FormInput.displayName = 'FormInput';

export default FormInput;
