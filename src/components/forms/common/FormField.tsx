import React from 'react';
import styled from 'styled-components';
import { formTokens, createFocusStyles } from '../../../styles/tokens/forms';

export interface FormFieldProps {
  label?: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const FieldContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${formTokens.spacing.sm};
`;

const Label = styled.label<{ required?: boolean }>`
  font-size: ${formTokens.typography.fontSizes.sm};
  font-weight: ${formTokens.typography.fontWeights.semibold};
  color: ${formTokens.colors.text};
  margin-bottom: ${formTokens.spacing.xs};
  display: block;
  
  ${props => props.required && `
    &::after {
      content: ' *';
      color: ${formTokens.colors.error};
    }
  `}
`;

const ErrorMessage = styled.div`
  color: ${formTokens.colors.error};
  font-size: ${formTokens.typography.fontSizes.xs};
  margin: 0;
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
  children,
  className,
  style
}) => {
  return (
    <FieldContainer className={className} style={style}>
      {label && (
        <Label required={required}>
          {label}
        </Label>
      )}
      {children}
      {error && (
        <ErrorMessage>{error}</ErrorMessage>
      )}
    </FieldContainer>
  );
};


