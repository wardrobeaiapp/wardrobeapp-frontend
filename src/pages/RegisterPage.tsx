import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useSupabaseAuth } from '../context/SupabaseAuthContext';
import Header from '../components/layout/Header/Header';
import Footer from '../components/layout/Footer';
import {
  AuthContainer,
  AuthCard,
  LogoContainer,
  LogoCircle,
  LogoIcon,
  BrandName,
  Tagline,
  AuthTitle,
  Subtitle,
  SocialButtonsContainer,
  GoogleButton,
  GoogleIcon,
  AppleButton,
  AppleIcon,
  Divider,
  DividerLine,
  DividerText,
  AuthForm,
  FormGroup,
  FormLabel,
  FormInput,
  ErrorMessage,
  PasswordInputWrapper,
  PasswordToggle,
  CheckboxGroup,
  CheckboxInput,
  CheckboxLabel,
  TermsLink,
  SubmitButton,
  LoginPrompt,
  LoginLink
} from './RegisterPage.styles';

// Page wrapper for layout
const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

export const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    agreeToTerms: false
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailConfirmationRequired, setEmailConfirmationRequired] = useState(false);
  const navigate = useNavigate();
  const { register: supabaseRegister } = useSupabaseAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    setEmailConfirmationRequired(false);
    
    try {
      // Call Supabase register function
      const response = await supabaseRegister(formData.username, formData.email, formData.password);
      
      // Check if email confirmation is required
      if (response?.emailConfirmationRequired) {
        setEmailConfirmationRequired(true);
        setIsLoading(false);
        return;
      }
      
      // If successful and no email confirmation required, navigate to onboarding
      navigate('/onboarding');
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageWrapper>
      <Header variant="welcome" />
      <AuthContainer>
        <AuthCard>
          <LogoContainer>
            <LogoCircle>
              <LogoIcon>👔</LogoIcon>
            </LogoCircle>
            <BrandName>WardrobeAI</BrandName>
            <Tagline>Dress smarter. Buy less. Feel better.</Tagline>
          </LogoContainer>
          
          <AuthTitle>Create Account</AuthTitle>
          <Subtitle>Join thousands optimizing their wardrobes</Subtitle>
        
        {error && (
          <ErrorMessage>{error}</ErrorMessage>
        )}
        
        {emailConfirmationRequired && (
          <div style={{ 
            padding: '15px',
            margin: '15px 0',
            backgroundColor: '#e7f3ff',
            borderRadius: '8px',
            borderLeft: '4px solid #2196f3',
            color: '#0d47a1'
          }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>Email Verification Required</h3>
            <p style={{ margin: '0', fontSize: '14px' }}>
              We've sent a verification email to <strong>{formData.email}</strong>. 
              Please check your inbox and click the verification link to complete your registration.
            </p>
            <p style={{ margin: '10px 0 0 0', fontSize: '14px' }}>
              After verifying your email, you can <LoginLink to="/login">log in here</LoginLink>.
            </p>
          </div>
        )}
        
        {!emailConfirmationRequired && (
          <>
            <SocialButtonsContainer>
              <GoogleButton type="button" onClick={() => alert('Google login would be implemented with a real auth provider')}>
                <GoogleIcon>
                  <svg 
                    width="18" 
                    height="18" 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 48 48"
                  >
                    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
                    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
                  </svg>
                </GoogleIcon>
                Continue with Google
              </GoogleButton>
              
              <AppleButton type="button" onClick={() => alert('Apple login would be implemented with a real auth provider')}>
                <AppleIcon>
                  <svg 
                    width="18" 
                    height="18" 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 384 512"
                  >
                    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
                  </svg>
                </AppleIcon>
                Continue with Apple
              </AppleButton>
            </SocialButtonsContainer>
            
            <Divider>
              <DividerLine />
              <DividerText>or with email</DividerText>
              <DividerLine />
            </Divider>
            
            <AuthForm onSubmit={handleSubmit}>
              <FormGroup>
                <FormLabel htmlFor="email">Email address</FormLabel>
                <FormInput
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <FormLabel htmlFor="username">Username</FormLabel>
                <FormInput
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <FormLabel htmlFor="password">Password</FormLabel>
                <PasswordInputWrapper>
                  <FormInput
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <PasswordToggle 
                    type="button" 
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </PasswordToggle>
                </PasswordInputWrapper>
              </FormGroup>
              
              <CheckboxGroup>
                <CheckboxInput
                  type="checkbox"
                  id="agreeToTerms"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  required
                />
                <CheckboxLabel htmlFor="agreeToTerms">
                  I agree to the <TermsLink href="#">Terms of Service</TermsLink> and <TermsLink href="#">Privacy Policy</TermsLink>
                </CheckboxLabel>
              </CheckboxGroup>
              
              <SubmitButton type="submit" disabled={isLoading}>
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </SubmitButton>
            </AuthForm>
          </>
        )}
        
        <LoginPrompt>
          Already have an account? <LoginLink to="/login">Sign in</LoginLink>
        </LoginPrompt>
      </AuthCard>
    </AuthContainer>
    <Footer variant="simple" />
  </PageWrapper>
  );
};

export default RegisterPage;
