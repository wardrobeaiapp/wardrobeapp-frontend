import styled from 'styled-components';
import { Link } from 'react-router-dom';

export const AuthContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
  padding: 1.5rem;
  background-color: #f9fafb;
`;

export const AuthCard = styled.div`
  background-color: white;
  border-radius: 1rem;
  padding: 2rem;
  width: 100%;
  max-width: 450px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  text-align: center;
`;

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

export const FormInput = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  color: #111827;
  
  &:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
  }
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

export const ForgotPasswordLink = styled.a`
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

export const SubmitButton = styled.button`
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

export const ErrorMessage = styled.div`
  color: #ef4444;
  background-color: #fee2e2;
  border-radius: 0.5rem;
  padding: 0.75rem;
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
  text-align: center;
`;

export const RegisterPrompt = styled.div`
  margin-top: 1.5rem;
  font-size: 0.875rem;
  color: #6b7280;
`;

export const RegisterLink = styled(Link)`
  color: #6366f1;
  text-decoration: none;
  font-weight: 500;
  
  &:hover {
    text-decoration: underline;
  }
`;
