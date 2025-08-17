import React, { TextareaHTMLAttributes, forwardRef } from 'react';
import styled, { css, DefaultTheme } from 'styled-components';

type TextareaSize = 'small' | 'medium' | 'large';
type TextareaVariant = 'default' | 'outline' | 'filled' | 'flushed';

// Extend TextareaHTMLAttributes but omit 'size' to avoid conflict with our size prop
type OmittedTextareaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'>;

export interface FormTextareaProps extends OmittedTextareaProps {
  /**
   * Size of the textarea
   * @default 'medium'
   */
  size?: TextareaSize;
  /**
   * Visual style variant
   * @default 'default'
   */
  variant?: TextareaVariant;
  /**
   * Whether the textarea is invalid
   */
  isInvalid?: boolean;
  /**
   * Whether the textarea is disabled
   */
  isDisabled?: boolean;
  /**
   * Whether the textarea is read-only
   */
  isReadOnly?: boolean;
  /**
   * Whether the textarea should take up the full width of its container
   */
  isFullWidth?: boolean;
  /**
   * Number of visible text lines
   */
  rows?: number;
  /**
   * Additional class name
   */
  className?: string;
}

interface StyledTextareaProps {
  $size: TextareaSize;
  $variant: TextareaVariant;
  $isInvalid?: boolean;
  $isFullWidth?: boolean;
}

const getSizeStyles = (theme: DefaultTheme) => ({
  small: css`
    padding: ${theme.space.xs} ${theme.space.sm};
    font-size: ${theme.typography.fontSize.sm};
    line-height: 1.5;
    min-height: 32px;
  `,
  medium: css`
    padding: ${theme.space.sm} ${theme.space.md};
    font-size: ${theme.typography.fontSize.base};
    line-height: 1.5;
    min-height: 40px;
  `,
  large: css`
    padding: ${theme.space.md} ${theme.space.lg};
    font-size: ${theme.typography.fontSize.lg};
    line-height: 1.5;
    min-height: 48px;
  `,
});

const getVariantStyles = (theme: DefaultTheme) => ({
  default: css`
    background-color: ${theme.colors.white};
    border: 1px solid ${theme.colors.gray300};
    color: ${theme.colors.textPrimary};
    box-shadow: ${theme.shadows.sm};
    transition: ${theme.transitions.property.common} ${theme.transitions.duration.normal} ${theme.transitions.easing['ease-in-out']};
    font-family: ${theme.typography.fontFamily.sans};

    &:focus {
      border-color: ${theme.colors.primary};
      box-shadow: 0 0 0 1px ${theme.colors.primary};
      outline: none;
    }
  `,
  outline: css`
    background-color: transparent;
    border: 1px solid ${theme.colors.border};
    color: ${theme.colors.textPrimary};
    transition: ${theme.transitions.property.common} ${theme.transitions.duration.normal} ${theme.transitions.easing['ease-in-out']};
    font-family: ${theme.typography.fontFamily.sans};

    &:focus {
      border-color: ${theme.colors.primary};
      box-shadow: 0 0 0 1px ${theme.colors.primary};
      outline: none;
    }
  `,
  filled: css`
    background-color: ${theme.colors.gray100};
    border: 1px solid transparent;
    color: ${theme.colors.textPrimary};
    transition: ${theme.transitions.property.common} ${theme.transitions.duration.normal} ${theme.transitions.easing['ease-in-out']};
    font-family: ${theme.typography.fontFamily.sans};

    &:focus {
      background-color: ${theme.colors.white};
      border-color: ${theme.colors.primary};
      box-shadow: 0 0 0 1px ${theme.colors.primary};
      outline: none;
    }
  `,
  flushed: css`
    background-color: transparent;
    border: none;
    border-bottom: 1px solid ${theme.colors.border};
    border-radius: 0;
    padding-left: 0;
    padding-right: 0;
    color: ${theme.colors.textPrimary};
    transition: ${theme.transitions.property.common} ${theme.transitions.duration.normal} ${theme.transitions.easing['ease-in-out']};
    font-family: ${theme.typography.fontFamily.sans};

    &:focus {
      border-color: ${theme.colors.primary};
      box-shadow: 0 1px 0 0 ${theme.colors.primary};
      outline: none;
    }
  `,
});

const StyledTextarea = styled.textarea<StyledTextareaProps>`
  width: ${({ $isFullWidth }) => ($isFullWidth ? '100%' : 'auto')};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-family: inherit;
  outline: none;
  transition: ${({ theme }) => theme.transitions.property.common} ${({ theme }) => theme.transitions.duration.normal} ${({ theme }) => theme.transitions.easing['ease-in-out']};
  resize: vertical;
  min-height: 100px;

  ${({ theme, $size }) => getSizeStyles(theme)[$size]}
  ${({ theme, $variant }) => getVariantStyles(theme)[$variant]}

  ${({ $isInvalid, theme }) =>
    $isInvalid &&
    css`
      border-color: ${theme.colors.danger};
      box-shadow: 0 0 0 1px ${theme.colors.danger};
      
      &:focus {
        border-color: ${theme.colors.danger};
        box-shadow: 0 0 0 1px ${theme.colors.danger};
      }
    `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background-color: ${({ theme }) => theme.colors.gray100};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.gray400};
  }
`;

export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  (
    {
      size = 'medium',
      variant = 'default',
      isInvalid = false,
      isDisabled = false,
      isReadOnly = false,
      isFullWidth = false,
      className,
      rows = 3,
      ...rest
    },
    ref
  ) => {
    return (
      <StyledTextarea
        ref={ref}
        $size={size}
        $variant={variant}
        $isInvalid={isInvalid}
        $isFullWidth={isFullWidth}
        disabled={isDisabled}
        readOnly={isReadOnly}
        className={className}
        rows={rows}
        {...rest}
      />
    );
  }
);

FormTextarea.displayName = 'FormTextarea';

export default FormTextarea;
