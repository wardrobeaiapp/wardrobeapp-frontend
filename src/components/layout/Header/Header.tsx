import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useSupabaseAuth } from '../../../context/SupabaseAuthContext';
import {
  HeaderContainer,
  Logo,
  LogoIcon,
  LogoText,
  Nav,
  NavLink,
  AuthButtons,
  SignInButton,
  SignUpButton,
  UserMenu,
  LogoutButton,
  MobileMenuButton,
  BackButton,
  HeaderTitle
} from './Header.styles';

interface HeaderProps {
  variant?: 'welcome' | 'app';
  title?: string;
  showBackButton?: boolean;
  onBackClick?: () => void | Promise<void>;
  isOnboarding?: boolean;
  currentStep?: number;
  totalSteps?: number;
}

const Header: React.FC<HeaderProps> = ({ 
  variant = 'app', 
  title, 
  showBackButton, 
  onBackClick, 
  isOnboarding = false,
  currentStep = 1,
  totalSteps = 8
}) => {
  const location = useLocation();
  const { isAuthenticated, logout } = useSupabaseAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <HeaderContainer>
      {showBackButton ? (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <BackButton onClick={onBackClick}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </BackButton>
          {title && <HeaderTitle>{title}</HeaderTitle>}
        </div>
      ) : (
        <Logo>
          <LogoIcon>👔</LogoIcon>
          <LogoText>WardrobeAI</LogoText>
        </Logo>
      )}

      {variant === 'welcome' ? (
        <>
          <Nav>
            <NavLink to="/features" $active={isActive('/features')}>Features</NavLink>
            <NavLink to="/pricing" $active={isActive('/pricing')}>Pricing</NavLink>
            <NavLink to="/how-it-works" $active={isActive('/how-it-works')}>How It Works</NavLink>
          </Nav>

          <AuthButtons>
            <SignInButton to="/login">Sign In</SignInButton>
            <SignUpButton to="/register">Sign Up</SignUpButton>
          </AuthButtons>
        </>
      ) : (
        <>
          {!isOnboarding && (
            <Nav>
              <NavLink to="/" $active={isActive('/')}>My Wardrobe</NavLink>
              <NavLink to="/calendar" $active={isActive('/calendar')}>Calendar</NavLink>
              <NavLink to="/ai-assistant" $active={isActive('/ai-assistant')}>AI Assistant</NavLink>
            </Nav>
          )}

          {isAuthenticated ? (
            <UserMenu>
              {isOnboarding ? (
                <div style={{ 
                  fontSize: '16px', 
                  fontWeight: 'bold',
                  color: '#333',
                  padding: '8px 16px'
                }}>
                  Step {currentStep} of {totalSteps}
                </div>
              ) : (
                <NavLink to="/profile" $active={isActive('/profile')}>Profile</NavLink>
              )}
              <LogoutButton onClick={logout}>Logout</LogoutButton>
            </UserMenu>
          ) : (
            <AuthButtons>
              <SignInButton to="/login">Sign In</SignInButton>
              <SignUpButton to="/register">Sign Up</SignUpButton>
            </AuthButtons>
          )}
        </>
      )}

      <MobileMenuButton onClick={toggleMobileMenu}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {mobileMenuOpen ? (
            <path d="M18 6L6 18M6 6l12 12" />
          ) : (
            <path d="M3 12h18M3 6h18M3 18h18" />
          )}
        </svg>
      </MobileMenuButton>
    </HeaderContainer>
  );
};

export default Header;
