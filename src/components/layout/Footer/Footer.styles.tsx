import styled from 'styled-components';
import { Link } from 'react-router-dom';

export const FooterContainer = styled.footer`
  padding: 4rem 1.5rem 2rem;
  background-color: #1f2937;
  color: white;
  
  @media (min-width: 768px) {
    padding: 4rem 2rem 2rem;
  }
`;

export const FooterContent = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  
  @media (min-width: 768px) {
    grid-template-columns: 2fr repeat(3, 1fr);
  }
`;

export const FooterLogo = styled.div`
  display: flex;
  align-items: center;
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
  margin-bottom: 1rem;
`;

export const FooterLogoIcon = styled.span`
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

export const FooterTagline = styled.p`
  color: #9ca3af;
  margin-bottom: 1rem;
  font-size: 0.875rem;
`;

export const FooterColumn = styled.div`
  display: flex;
  flex-direction: column;
`;

export const FooterColumnTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: white;
`;

export const FooterLink = styled(Link)`
  color: #9ca3af;
  text-decoration: none;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  
  &:hover {
    color: white;
  }
`;

export const FooterExternalLink = styled.a`
  color: #9ca3af;
  text-decoration: none;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  
  &:hover {
    color: white;
  }
`;

export const Copyright = styled.p`
  color: #9ca3af;
  font-size: 0.75rem;
  margin-top: 2rem;
  text-align: center;
`;

export const SimpleFooter = styled.footer`
  padding: 1.5rem;
  background-color: #f9fafb;
  border-top: 1px solid #f3f4f6;
  text-align: center;
  color: #6b7280;
  font-size: 0.875rem;
`;

export const SimpleFooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
  }
`;

export const SimpleFooterLinks = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-top: 1rem;
  
  @media (min-width: 768px) {
    margin-top: 0;
  }
`;

export const SimpleFooterLink = styled(Link)`
  color: #6b7280;
  text-decoration: none;
  
  &:hover {
    color: #4b5563;
    text-decoration: underline;
  }
`;
