import React, { FormHTMLAttributes, ReactNode, forwardRef } from 'react';
import styled from 'styled-components';

export interface FormProps extends Omit<FormHTMLAttributes<HTMLFormElement>, 'onSubmit'> {
  /**
   * Form content
   */
  children: ReactNode;
  /**
   * Form submission handler
   */
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
  /**
   * Form layout
   * @default 'vertical'
   */
  layout?: 'vertical' | 'horizontal' | 'inline';
  /**
   * Gap between form items
   * @default '1.5rem'
   */
  gap?: string;
  /**
   * Additional class name
   */
  className?: string;
}

interface StyledFormProps {
  $layout?: 'vertical' | 'horizontal' | 'inline';
  $gap?: string;
}

const StyledForm = styled.form<StyledFormProps>`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: ${({ $gap = '1.5rem' }) => $gap};
  
  ${({ $layout = 'vertical' }) => 
    $layout === 'horizontal' &&
    `
      .form-field {
        flex-direction: row;
        align-items: center;
        
        > label {
          margin-bottom: 0;
          margin-right: 1rem;
          min-width: 120px;
        }
      }
    `}

  ${({ $layout = 'vertical' }) => 
    $layout === 'inline' &&
    `
      flex-direction: row;
      flex-wrap: wrap;
      align-items: flex-end;
      gap: 1rem;
      
      .form-field {
        margin-bottom: 0;
      }
    `}
`;

/**
 * A flexible form component that handles form submission and layout.
 * Supports vertical, horizontal, and inline layouts.
 */
export const Form = forwardRef<HTMLFormElement, FormProps>(({
  children,
  onSubmit,
  className = '',
  layout = 'vertical',
  gap = '1.5rem',
  ...rest
}, ref) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(e);
    }
  };

  return (
    <StyledForm
      ref={ref}
      onSubmit={handleSubmit}
      className={`form ${className}`.trim()}
      $layout={layout}
      $gap={gap}
      {...rest}
    >
      {children}
    </StyledForm>
  );
});

Form.displayName = 'Form';

export default Form;
