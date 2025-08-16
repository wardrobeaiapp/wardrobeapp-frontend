import React, { ReactNode } from 'react';
import styled from 'styled-components';
import { Theme } from '../../../theme/types';

export interface FormFieldProps {
  /**
   * Field label
   */
  label?: string;
  /**
   * Field label position
   * @default 'top'
   */
  labelPosition?: 'top' | 'left' | 'right';
  /**
   * Whether the field is required
   * @default false
   */
  required?: boolean;
  /**
   * Error message to display below the field
   */
  error?: string;
  /**
   * Help text to display below the field
   */
  helpText?: string;
  /**
   * Field content
   */
  children: ReactNode;
  /**
   * Additional class name
   */
  className?: string;
  /**
   * Inline styles for the form field container
   */
  style?: React.CSSProperties;
  /**
   * HTML id attribute
   */
  htmlFor?: string;
  /**
   * Whether the field is disabled
   * @default false
   */
  disabled?: boolean;
}

interface FieldContainerProps {
  $labelPosition: 'top' | 'left' | 'right';
  $disabled?: boolean;
}

const FieldContainer = styled.div<FieldContainerProps>`
  display: flex;
  flex-direction: ${({ $labelPosition }) => 
    $labelPosition === 'left' || $labelPosition === 'right' ? 'row' : 'column'};
  gap: 0.5rem;
  align-items: ${({ $labelPosition }) => 
    $labelPosition === 'left' || $labelPosition === 'right' ? 'center' : 'flex-start'};
  opacity: ${({ $disabled }) => ($disabled ? 0.7 : 1)};
  pointer-events: ${({ $disabled }) => ($disabled ? 'none' : 'auto')};
`;

interface LabelProps {
  $labelPosition: 'top' | 'left' | 'right';
  $disabled?: boolean;
}

const Label = styled.label<LabelProps>`
  font-weight: 500;
  font-size: 0.875rem;
  color: ${({ theme, $disabled }) => 
    $disabled ? theme.colors.textSecondary : theme.colors.textPrimary};
  min-width: ${({ $labelPosition }) => 
    $labelPosition === 'left' || $labelPosition === 'right' ? '120px' : 'auto'};
  order: ${({ $labelPosition }) => 
    $labelPosition === 'right' ? 2 : 'initial'};
`;

const RequiredIndicator = styled.span`
  color: ${({ theme }: { theme: Theme }) => theme.colors.danger};
  margin-left: 0.25rem;
`;

const FieldContent = styled.div`
  flex: 1;
  width: 100%;
`;

const ErrorText = styled.div`
  color: ${({ theme }: { theme: Theme }) => theme.colors.danger};
  font-size: 0.75rem;
  margin-top: 0.25rem;
`;

const HelpText = styled.div`
  color: ${({ theme }: { theme: Theme }) => theme.colors.textSecondary};
  font-size: 0.75rem;
  margin-top: 0.25rem;
`;

/**
 * A form field component that provides consistent styling and layout for form inputs.
 * Handles labels, validation errors, and help text in a consistent way.
 */
const FormField: React.FC<FormFieldProps> = ({
  label,
  labelPosition = 'top',
  required = false,
  error,
  helpText,
  children,
  className,
  style,
  htmlFor,
  disabled = false,
}) => {
  return (
    <FieldContainer 
      className={`form-field ${className || ''}`}
      $labelPosition={labelPosition}
      $disabled={disabled}
      style={style}
    >
      {label && (
        <Label 
          htmlFor={htmlFor}
          $labelPosition={labelPosition}
          $disabled={disabled}
        >
          {label}
          {required && <RequiredIndicator>*</RequiredIndicator>}
        </Label>
      )}
      <FieldContent>
        {children}
        {error && <ErrorText>{error}</ErrorText>}
        {helpText && !error && <HelpText>{helpText}</HelpText>}
      </FieldContent>
    </FieldContainer>
  );
};

// Default export for backward compatibility
export default FormField;
