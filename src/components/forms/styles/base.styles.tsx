import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { theme } from '../../../styles/theme';

// Form Container Styles
export const FormContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
  padding: 1.5rem;
  background-color: #f9fafb;
`;

export const FormCard = styled.div`
  background-color: white;
  border-radius: 1rem;
  padding: 2rem;
  width: 100%;
  max-width: 450px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  text-align: center;
`;

// Logo and Branding Styles
export const LogoContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1.5rem;
`;

export const LogoCircle = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3.5rem;
  height: 3.5rem;
  background-color: #6366f1;
  border-radius: 50%;
  margin-bottom: 0.75rem;
`;

export const LogoIcon = styled.span`
  font-size: 1.75rem;
  color: white;
`;

export const BrandName = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 0.25rem 0;
  color: #111827;
`;

export const Tagline = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
`;

// Form Title and Subtitle Styles
export const FormTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: #111827;
`;

export const FormSubtitle = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 1.5rem 0;
`;

// Social Login Buttons
export const SocialButtonsContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

export const SocialButton = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem;
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: #f9fafb;
  }
`;

export const SocialIcon = styled.span`
  margin-right: 0.5rem;
  font-size: 1.25rem;
`;

// Divider
export const Divider = styled.div`
  display: flex;
  align-items: center;
  margin: 1.5rem 0;
`;

export const DividerLine = styled.div`
  flex: 1;
  height: 1px;
  background-color: #e5e7eb;
`;

export const DividerText = styled.span`
  padding: 0 1rem;
  color: #6b7280;
  font-size: 0.875rem;
`;

// Form Elements
export const Form = styled.form`
  text-align: left;
`;

export const FormGroup = styled.div`
  margin-bottom: 1.5rem;
  width: 100%;
  position: relative;
  z-index: 5;
`;

export const StyledFieldset = styled.fieldset`
  border: none;
  padding: 0;
  margin: 0;
  min-width: 0;
  
  legend {
    padding: 0;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #374151;
    font-size: 0.875rem;
  }
`;

export const FormLabel = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
`;

export const FormInput = styled.input`
  width: 100%;
  padding: ${theme.spacing.md};
  border: 1px solid ${theme.colors.gray[300]};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.sm};
  font-family: ${theme.typography.fontFamily};
  color: ${theme.colors.gray[900]};
  background-color: white;
  transition: ${theme.transitions.fast};
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.purple[500]};
    box-shadow: 0 0 0 2px ${theme.colors.purple[200]};
  }
  
  &:hover:not(:focus) {
    border-color: ${theme.colors.gray[400]};
  }
  
  &:disabled {
    background-color: ${theme.colors.gray[50]};
    color: ${theme.colors.gray[500]};
    cursor: not-allowed;
  }
  
  &::placeholder {
    color: ${theme.colors.gray[400]};
  }
`;

export const FormSelect = styled.select`
  width: 100%;
  padding: ${theme.spacing.md};
  border: 1px solid ${theme.colors.gray[300]};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.sm};
  font-family: ${theme.typography.fontFamily};
  color: ${theme.colors.gray[900]};
  background-color: white;
  cursor: pointer;
  transition: ${theme.transitions.fast};
  appearance: auto !important; /* Force native appearance */
  -webkit-appearance: auto !important;
  -moz-appearance: auto !important;
  
  &:focus, &:hover, &:active {
    outline: none;
    border-color: ${theme.colors.purple[500]};
    box-shadow: 0 0 0 2px ${theme.colors.purple[200]};
  }
  
  &:disabled {
    background-color: ${theme.colors.gray[50]};
    color: ${theme.colors.gray[500]};
    cursor: not-allowed;
  }
`;

export const FormTextarea = styled.textarea`
  width: 100%;
  padding: ${theme.spacing.md};
  border: 1px solid ${theme.colors.gray[300]};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.sm};
  font-family: ${theme.typography.fontFamily};
  color: ${theme.colors.gray[900]};
  background-color: white;
  min-height: 100px;
  resize: vertical;
  transition: ${theme.transitions.fast};
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.purple[500]};
    box-shadow: 0 0 0 2px ${theme.colors.purple[200]};
  }
  
  &:hover:not(:focus) {
    border-color: ${theme.colors.gray[400]};
  }
  
  &:disabled {
    background-color: ${theme.colors.gray[50]};
    color: ${theme.colors.gray[500]};
    cursor: not-allowed;
    resize: none;
  }
  
  &::placeholder {
    color: ${theme.colors.gray[400]};
  }
`;

export const FormCheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const FormCheckbox = styled.input`
  width: 1rem;
  height: 1rem;
  accent-color: #6366f1;
`;

export const FormCheckboxLabel = styled.label`
  font-size: 0.875rem;
  color: #374151;
`;

export const PasswordInputWrapper = styled.div`
  position: relative;
`;

export const PasswordToggle = styled.button`
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 1rem;
  color: #6b7280;
  cursor: pointer;
`;

export const FormLink = styled.a`
  display: block;
  text-align: right;
  font-size: 0.875rem;
  color: #6366f1;
  text-decoration: none;
  margin-bottom: 1.5rem;
  
  &:hover {
    text-decoration: underline;
  }
`;

// Buttons
export const FormButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  background-color: #6366f1;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: #4f46e5;
  }
  
  &:disabled {
    background-color: #a5b4fc;
    cursor: not-allowed;
  }
`;

export const FormButtonSecondary = styled.button`
  width: 100%;
  padding: 0.75rem;
  background-color: white;
  color: #6366f1;
  border: 1px solid #6366f1;
  border-radius: 0.5rem;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: #f5f3ff;
  }
  
  &:disabled {
    color: #a5b4fc;
    border-color: #a5b4fc;
    cursor: not-allowed;
  }
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

// Messages
export const ErrorMessage = styled.div`
  color: #ef4444;
  background-color: #fee2e2;
  border-radius: 0.5rem;
  padding: 0.75rem;
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
  text-align: center;
`;

export const SuccessMessage = styled.div`
  color: #10b981;
  background-color: #d1fae5;
  border-radius: 0.5rem;
  padding: 0.75rem;
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
  text-align: center;
`;

// Links
export const TextLink = styled(Link)`
  color: #6366f1;
  text-decoration: none;
  font-weight: 500;
  
  &:hover {
    text-decoration: underline;
  }
`;

export const TextPrompt = styled.div`
  margin-top: 1.5rem;
  font-size: 0.875rem;
  color: #6b7280;
`;
