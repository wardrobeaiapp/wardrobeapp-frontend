import React, { ReactNode, useId, cloneElement, isValidElement, ReactElement } from 'react';
import styled from 'styled-components';
import { Theme } from '../../../theme/types';

// Type for form control elements that can receive props
type FormControlElement = ReactElement<{ id?: string; disabled?: boolean; 'aria-invalid'?: string; 'aria-describedby'?: string }>;

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

const ErrorMessage = styled.div`
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
export const FormField: React.FC<FormFieldProps> = ({
  label,
  labelPosition = 'top',
  required = false,
  error,
  helpText,
  children,
  className,
  style,
  htmlFor: propHtmlFor,
  disabled = false,
}) => {
  const generatedId = useId();
  const fieldId = propHtmlFor || `field-${generatedId}`;
  
  // Clone the child element and inject the id prop if it's a form control
  const enhancedChildren = React.Children.map(children, (child) => {
    if (isValidElement(child) && !propHtmlFor) {
      const childElement = child as FormControlElement;
      const childProps = childElement.props;
      
      return cloneElement(childElement, {
        id: childProps.id || fieldId,
        disabled: childProps.disabled ?? disabled,
        'aria-invalid': error ? 'true' : undefined,
        'aria-describedby': error ? `${fieldId}-error` : undefined,
      });
    }
    return child;
  });
  return (
    <FieldContainer 
      className={`form-field ${className || ''}`}
      $labelPosition={labelPosition}
      $disabled={disabled}
      style={style}
    >
      {label && (
        <Label
          htmlFor={fieldId}
          $labelPosition={labelPosition}
          $disabled={disabled}
        >
          {label}
          {required && <RequiredIndicator aria-hidden="true">*</RequiredIndicator>}
        </Label>
      )}
      <FieldContent>
        {enhancedChildren}
        {error && <ErrorMessage id={`${fieldId}-error`} role="alert">{error}</ErrorMessage>}
        {helpText && !error && <HelpText id={`${fieldId}-help`}>{helpText}</HelpText>}
      </FieldContent>
    </FieldContainer>
  );
};

// Default export for backward compatibility
export default FormField;
