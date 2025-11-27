import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { theme } from '../styles/theme';
import { FormInput as BaseFormInput } from '../components/forms/styles/base.styles';
import { AuthCard as BaseAuthCard } from '../components/cards/Card.styles';

export const AuthContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
  padding: 1.5rem;
  background-color: #f9fafb;
`;

// Use centralized AuthCard with theme integration
export const AuthCard = BaseAuthCard;

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
  border-radius: 50%;
`;

export const LogoIcon = styled.span`
  font-size: 1.75rem;
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

export const AuthTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: #111827;
`;

export const Subtitle = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 1.5rem 0;
`;

export const SocialButtonsContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

export const GoogleButton = styled.button`
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

export const GoogleIcon = styled.span`
  margin-right: 0.5rem;
  font-size: 1.25rem;
`;

export const AppleButton = styled.button`
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

export const AppleIcon = styled.span`
  margin-right: 0.5rem;
  font-size: 1.25rem;
`;

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

export const AuthForm = styled.form`
  text-align: left;
`;

export const FormGroup = styled.div`
  margin-bottom: 1.25rem;
`;

export const FormLabel = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
`;

// Use centralized FormInput with theme integration
export const FormInput = BaseFormInput;

export const HelperText = styled.div`
  font-size: 12px;
  color: #666;
  margin-top: 4px;
`;

export const ErrorMessage = styled.div`
  color: #e53935;
  margin-bottom: 20px;
  padding: 10px;
  background-color: rgba(229, 57, 53, 0.1);
  border-radius: 4px;
  text-align: center;
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
  color: #6b7280;
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
`;

export const CheckboxGroup = styled.div`
  display: flex;
  align-items: flex-start;
  margin-bottom: 1.5rem;
`;

export const CheckboxInput = styled.input`
  margin-right: 0.5rem;
  margin-top: 0.25rem;
`;

export const CheckboxLabel = styled.label`
  font-size: 0.875rem;
  color: #374151;
  line-height: 1.5;
`;

export const TermsLink = styled.a`
  color: ${theme.colors.primary};
  text-decoration: none;
  font-weight: 500;
  
  &:hover {
    text-decoration: underline;
  }
`;

export const SubmitButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  background-color: ${theme.colors.primary};
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: ${theme.colors.primaryHover};
  }
  
  &:disabled {
    background-color: #a5b4fc;
    cursor: not-allowed;
  }
`;

export const LoginPrompt = styled.div`
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.875rem;
  color: #6b7280;
`;

export const LoginLink = styled(Link)`
  color: ${theme.colors.primary};
  text-decoration: none;
  font-weight: 500;
  margin-left: 0.25rem;
  
  &:hover {
    text-decoration: underline;
  }
`;
