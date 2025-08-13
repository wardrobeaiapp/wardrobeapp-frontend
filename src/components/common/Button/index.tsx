import React from 'react';
import styled from 'styled-components';

interface ButtonProps {
  primary?: boolean;
  outlined?: boolean;
  small?: boolean;
  success?: boolean; // New success variant for green buttons
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

// Use a separate interface for styled-components to avoid passing boolean props to DOM
interface StyledButtonProps {
  $primary?: boolean;
  $outlined?: boolean;
  $small?: boolean;
  $success?: boolean; // New success variant for green buttons
}

const StyledButton = styled.button<StyledButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: ${props => (props.$small ? '0.5rem 1rem' : '0.75rem 1.5rem')};
  font-size: ${props => (props.$small ? '0.875rem' : '1rem')};
  font-weight: 500;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  
  ${props => props.$primary && !props.$outlined && `
    background-color: #6366f1;
    color: white;
    border: 1px solid #6366f1;
    
    &:hover:not(:disabled) {
      background-color: #4f46e5;
      border-color: #4f46e5;
    }
  `}
  
  ${props => props.$primary && props.$outlined && `
    background-color: transparent;
    color: #6366f1;
    border: 1px solid #6366f1;
    
    &:hover:not(:disabled) {
  `}
  
  /* Success variant - green button for save/success actions */
  ${props => props.$success && !props.$outlined && `
    background-color: #34A853;
    color: white;
    border: 1px solid #34A853;
    
    &:hover:not(:disabled) {
      background-color: #2E8B57;
      border-color: #2E8B57;
    }
  `}
  
  ${props => props.$success && props.$outlined && `
    background-color: transparent;
    color: #34A853;
    border: 1px solid #34A853;
    
    &:hover:not(:disabled) {
      background-color: rgba(99, 102, 241, 0.1);
    }
  `}
  
  ${props => !props.$primary && !props.$outlined && `
    background-color: #f3f4f6;
    color: #1f2937;
    border: 1px solid #e5e7eb;
    
    &:hover:not(:disabled) {
      background-color: #e5e7eb;
    }
  `}
  
  ${props => !props.$primary && props.$outlined && `
    background-color: transparent;
    color: #4b5563;
    border: 1px solid #d1d5db;
    
    &:hover:not(:disabled) {
      background-color: #f3f4f6;
    }
  `}
  
  &:disabled {
    opacity: 0.6;
  }
`;

const Button: React.FC<ButtonProps> = ({
  primary = true,
  outlined = false,
  small = false,
  success = false,
  onClick,
  type = 'button',
  disabled = false,
  children,
  style,
  className
}) => {
  return (
    <StyledButton
      $primary={primary && !success} // Only use primary if success is false
      $outlined={outlined}
      $small={small}
      $success={success}
      onClick={onClick}
      type={type}
      disabled={disabled}
      style={style}
      className={className}
    >
      {children}
    </StyledButton>
  );
};

export default Button;
