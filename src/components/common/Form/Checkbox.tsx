import React, { forwardRef } from 'react';
import styled from 'styled-components';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /**
   * Label text for the checkbox
   */
  label?: string;
  /**
   * Whether the checkbox is checked
   */
  checked?: boolean;
  /**
   * Whether the checkbox is disabled
   */
  disabled?: boolean;
  /**
   * Callback when the checkbox state changes
   */
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /**
   * Additional class name
   */
  className?: string;
}

interface CheckboxContainerProps {
  $disabled?: boolean;
}

const CheckboxContainer = styled.div<CheckboxContainerProps>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ $disabled }) => ($disabled ? 0.7 : 1)};
`;

const StyledCheckbox = styled.input.attrs({ type: 'checkbox' })`
  width: 16px;
  height: 16px;
  accent-color: #8b5cf6;
  cursor: inherit;
`;

const StyledLabel = styled.label`
  font-size: 14px;
  color: #374151;
  cursor: inherit;
  user-select: none;
`;

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, className, disabled, id: propId, ...props }, ref) => {
    // Generate a unique ID if one isn't provided
    const id = React.useId();
    const checkboxId = propId || `checkbox-${id}`;
    
    return (
      <CheckboxContainer className={className} $disabled={disabled}>
        <StyledCheckbox
          ref={ref}
          id={checkboxId}
          disabled={disabled}
          aria-disabled={disabled}
          {...props}
        />
        {label && (
          <StyledLabel htmlFor={checkboxId}>
            {label}
          </StyledLabel>
        )}
      </CheckboxContainer>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;
