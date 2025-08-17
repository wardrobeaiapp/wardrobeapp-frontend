import React from 'react';
import styled from 'styled-components';
import { formTokens, createFocusStyles } from '../../../styles/tokens/forms';

export interface FormFieldProps {
  label?: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const FieldContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${formTokens.spacing.sm};
`;

const Label = styled.label`
  font-size: ${formTokens.typography.fontSizes.sm};
  font-weight: ${formTokens.typography.fontWeights.semibold};
  color: ${formTokens.colors.text};
  margin-bottom: ${formTokens.spacing.xs};
  display: block;
`;

const ErrorMessage = styled.div`
  color: ${formTokens.colors.error};
  font-size: ${formTokens.typography.fontSizes.xs};
  margin: ${formTokens.spacing.xs} 0 0;
`;

const HelpText = styled.div`
  color: ${formTokens.colors.textMuted};
  font-size: ${formTokens.typography.fontSizes.xs};
  margin: ${formTokens.spacing.xs} 0 0;
  font-style: italic;
`;

// Base input styles that can be applied to form elements
export const BaseInput = styled.input`
  width: 100%;
  padding: ${formTokens.form.inputPadding};
  border: 1px solid ${formTokens.colors.border};
  border-radius: ${formTokens.borderRadius.base};
  font-size: ${formTokens.typography.fontSizes.sm};
  transition: ${formTokens.transitions.colors};
  background-color: ${formTokens.colors.background.primary};
  
  &:focus {
    ${createFocusStyles()}
  }
  
  &::placeholder {
    color: ${formTokens.colors.textPlaceholder};
  }
  
  &:disabled {
    background-color: ${formTokens.colors.background.muted};
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

export const BaseSelect = styled.select`
  width: 100%;
  padding: ${formTokens.form.inputPadding};
  border: 1px solid ${formTokens.colors.border};
  border-radius: ${formTokens.borderRadius.base};
  font-size: ${formTokens.typography.fontSizes.sm};
  background-color: ${formTokens.colors.background.primary};
  transition: ${formTokens.transitions.colors};
  
  &:focus {
    ${createFocusStyles()}
  }
  
  &:disabled {
    background-color: ${formTokens.colors.background.muted};
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

export const BaseTextarea = styled.textarea`
  width: 100%;
  padding: ${formTokens.form.inputPadding};
  border: 1px solid ${formTokens.colors.border};
  border-radius: ${formTokens.borderRadius.base};
  font-size: ${formTokens.typography.fontSizes.sm};
  resize: vertical;
  min-height: 80px;
  transition: ${formTokens.transitions.colors};
  background-color: ${formTokens.colors.background.primary};
  
  &:focus {
    ${createFocusStyles()}
  }
  
  &::placeholder {
    color: ${formTokens.colors.textPlaceholder};
  }
  
  &:disabled {
    background-color: ${formTokens.colors.background.muted};
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

export const FormField: React.FC<FormFieldProps> = ({
  label,
  required,
  error,
  helpText,
  children,
  className,
  style
}) => {
  // Generate a unique ID for the input if it doesn't have one
  const id = React.useId();
  
  // Clone the child element to ensure it has proper ID and aria attributes
  const enhancedChildren = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      const childElement = child as React.ReactElement<{ id?: string }>;
      const childProps = {
        id: childElement.props.id || id,
        'aria-invalid': error ? 'true' : undefined,
        'aria-required': required ? 'true' : undefined,
        'aria-describedby': error ? `${id}-error` : undefined,
      };
      
      return React.cloneElement(childElement, childProps);
    }
    return child;
  });

  return (
    <FieldContainer className={className} style={style}>
      {label && (
        <Label htmlFor={id}>
          {label}
          {required && <span aria-hidden="true">*</span>}
        </Label>
      )}
      {enhancedChildren}
      {error && <ErrorMessage id={`${id}-error`}>{error}</ErrorMessage>}
      {helpText && !error && <HelpText>{helpText}</HelpText>}
    </FieldContainer>
  );
};
