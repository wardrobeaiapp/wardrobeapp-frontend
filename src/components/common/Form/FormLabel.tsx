import React from 'react';
import styled from 'styled-components';
import { Theme } from '../../../theme/types';

export interface FormLabelProps {
  /**
   * The label text
   */
  children: React.ReactNode;
  /**
   * Whether the field is required
   * @default false
   */
  required?: boolean;
  /**
   * HTML id attribute to associate with the label
   */
  htmlFor?: string;
  /**
   * Additional class name
   */
  className?: string;
  /**
   * Whether the label should be visually hidden
   * @default false
   */
  visuallyHidden?: boolean;
  /**
   * Whether the label is disabled
   * @default false
   */
  disabled?: boolean;
}

interface StyledLabelProps {
  $disabled?: boolean;
  $visuallyHidden?: boolean;
}

const StyledLabel = styled.label<StyledLabelProps>`
  display: inline-block;
  font-weight: 500;
  font-size: 0.875rem;
  color: ${({ theme, $disabled }: { theme: Theme, $disabled?: boolean }) => 
    $disabled ? theme.colors.textSecondary : theme.colors.textPrimary};
  margin-bottom: 0.375rem;
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ $disabled }) => ($disabled ? 0.7 : 1)};
  ${({ $visuallyHidden }) => 
    $visuallyHidden &&
    `
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    `}
`;

const RequiredIndicator = styled.span`
  color: ${({ theme }: { theme: Theme }) => theme.colors.danger};
  margin-left: 0.25rem;
`;

/**
 * A form label component that provides consistent styling for form labels.
 * Supports required field indicators and can be visually hidden for accessibility.
 */
export const FormLabel: React.FC<FormLabelProps> = ({
  children,
  required = false,
  htmlFor,
  className,
  visuallyHidden = false,
  disabled = false,
}) => {
  return (
    <StyledLabel
      htmlFor={htmlFor}
      className={`form-label ${className || ''}`}
      $disabled={disabled}
      $visuallyHidden={visuallyHidden}
    >
      {children}
      {required && <RequiredIndicator>*</RequiredIndicator>}
    </StyledLabel>
  );
};

export default FormLabel;
