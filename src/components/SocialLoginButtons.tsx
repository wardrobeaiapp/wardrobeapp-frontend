import React from 'react';
import styled from 'styled-components';

interface SocialLoginButtonsProps {
  onGoogleLogin: () => void;
  onAppleLogin: () => void;
}

const SocialLoginButtons: React.FC<SocialLoginButtonsProps> = ({ 
  onGoogleLogin, 
  onAppleLogin 
}) => {
  return (
    <SocialButtonsContainer>
      <Divider>
        <DividerLine />
        <DividerText>or continue with</DividerText>
        <DividerLine />
      </Divider>
      
      <ButtonsRow>
        <SocialButton onClick={onGoogleLogin}>
          <GoogleIcon>
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path
                fill="currentColor"
                d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
              />
            </svg>
          </GoogleIcon>
          <span>Google</span>
        </SocialButton>
        
        <SocialButton onClick={onAppleLogin}>
          <AppleIcon>
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path
                fill="currentColor"
                d="M16.462,1c0.3,2.5-0.791,4.995-2.365,6.567c-1.6,1.6-3.466,2.86-6.067,2.691c-0.234-2.102,0.765-4.296,2.365-5.896 S14.162,1.192,16.462,1z M21.707,16.538c-0.507,1.158-0.751,1.673-1.407,2.693c-0.917,1.429-2.211,3.21-3.815,3.224 c-1.418,0.012-1.776-0.926-3.694-0.911c-1.918,0.012-2.317,0.924-3.735,0.909c-1.604-0.013-2.831-1.625-3.748-3.054 c-2.566-4.002-2.826-8.69-1.248-11.184c1.117-1.76,2.878-2.791,4.575-2.791c1.728,0,2.814,0.926,4.244,0.926 c1.386,0,2.23-0.925,4.232-0.925c1.511,0,3.109,0.823,4.242,2.245C17.431,9.368,18.116,15.066,21.707,16.538L21.707,16.538z"
              />
            </svg>
          </AppleIcon>
          <span>Apple</span>
        </SocialButton>
      </ButtonsRow>
    </SocialButtonsContainer>
  );
};

const SocialButtonsContainer = styled.div`
  width: 100%;
  margin-top: 1.5rem;
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const DividerLine = styled.div`
  flex: 1;
  height: 1px;
  background-color: #e5e7eb;
`;

const DividerText = styled.span`
  padding: 0 1rem;
  color: #6b7280;
  font-size: 0.875rem;
`;

const ButtonsRow = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
`;

const SocialButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: background-color 0.2s, border-color 0.2s;
  
  &:hover {
    background-color: #f9fafb;
    border-color: #d1d5db;
  }
`;

const GoogleIcon = styled.div`
  color: #ea4335;
`;

const AppleIcon = styled.div`
  color: #000000;
`;

export default SocialLoginButtons;
