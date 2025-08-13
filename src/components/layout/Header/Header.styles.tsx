import styled from 'styled-components';
import { Link } from 'react-router-dom';

export const HeaderContainer = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f3f4f6;
  background-color: #ffffff;
  
  @media (min-width: 768px) {
    padding: 1rem 2rem;
  }
`;

export const Logo = styled.div`
  display: flex;
  align-items: center;
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
`;

export const LogoIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  margin-right: 0.5rem;
  background-color: #6366f1;
  color: white;
  border-radius: 0.25rem;
  font-size: 1rem;
`;

export const LogoText = styled.span`
  display: inline-block;
`;

export const Nav = styled.nav`
  display: none;
  
  @media (min-width: 768px) {
    display: flex;
    align-items: center;
  }
`;

export const NavLink = styled(Link)<{ $active?: boolean }>`
  margin-right: 1.5rem;
  color: ${props => props.$active ? '#6366f1' : '#4b5563'};
  text-decoration: none;
  font-weight: ${props => props.$active ? '600' : '500'};
  
  &:hover {
    color: #6366f1;
  }
`;

export const AuthButtons = styled.div`
  display: flex;
  align-items: center;
`;

export const SignInButton = styled(Link)`
  display: inline-block;
  padding: 0.5rem 1rem;
  color: #6366f1;
  font-weight: 600;
  text-decoration: none;
  
  &:hover {
    color: #4f46e5;
  }
`;

export const SignUpButton = styled(Link)`
  display: inline-block;
  padding: 0.5rem 1rem;
  background-color: #6366f1;
  color: white;
  font-weight: 600;
  text-decoration: none;
  border-radius: 0.25rem;
  
  &:hover {
    background-color: #4f46e5;
  }
`;

// For authenticated users
export const UserMenu = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

export const UserAvatar = styled.div`
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background-color: #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6366f1;
  font-weight: 600;
  cursor: pointer;
`;

export const LogoutButton = styled.button`
  display: inline-block;
  padding: 0.5rem 1rem;
  color: #ef4444;
  background: none;
  border: none;
  font-weight: 600;
  cursor: pointer;
  
  &:hover {
    color: #dc2626;
    text-decoration: underline;
  }
`;

export const MobileMenuButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  background: none;
  border: none;
  cursor: pointer;
  
  @media (min-width: 768px) {
    display: none;
  }
`;

export const BackButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  color: #4b5563;
  font-weight: 500;
  padding: 0.5rem;
  margin-right: 0.5rem;
  
  &:hover {
    color: #6366f1;
  }
`;

export const HeaderTitle = styled.h1`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
`;
