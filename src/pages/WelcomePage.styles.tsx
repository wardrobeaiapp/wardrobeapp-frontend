import styled from 'styled-components';
import { Link } from 'react-router-dom';

// Mobile-first design with desktop overrides
export const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #ffffff;
  color: #1f2937;
  font-family: 'Inter', sans-serif;
`;

// Header
export const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f3f4f6;
  
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

export const Nav = styled.nav`
  display: none;
  
  @media (min-width: 768px) {
    display: flex;
    align-items: center;
    gap: 2rem;
  }
`;

export const NavLink = styled.a`
  color: #4b5563;
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  
  &:hover {
    color: #6366f1;
  }
`;

export const SignInButton = styled(Link)`
  display: none;
  
  @media (min-width: 768px) {
    display: inline-block;
    padding: 0.5rem 1rem;
    background-color: #6366f1;
    color: white;
    border-radius: 0.25rem;
    font-weight: 500;
    font-size: 0.875rem;
    text-decoration: none;
    
    &:hover {
      background-color: #4f46e5;
    }
  }
`;

// Hero Section
export const HeroSection = styled.section`
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  
  @media (min-width: 768px) {
    padding: 4rem 2rem;
    flex-direction: row;
    justify-content: space-between;
    text-align: left;
    max-width: 1200px;
    margin: 0 auto;
  }
`;

export const HeroContent = styled.div`
  @media (min-width: 768px) {
    flex: 1;
    max-width: 600px;
  }
`;

export const HeroTitle = styled.h1`
  font-size: 2rem;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 1.5rem;
  color: #111827;
  
  @media (min-width: 768px) {
    font-size: 3rem;
  }
`;

export const PurpleText = styled.span`
  display: block;
  color: #6366f1;
`;

export const HeroDescription = styled.p`
  color: #4b5563;
  font-size: 1rem;
  line-height: 1.5;
  margin-bottom: 2rem;
  
  @media (min-width: 768px) {
    font-size: 1.125rem;
  }
`;

export const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  
  @media (min-width: 768px) {
    flex-direction: row;
    width: auto;
  }
`;

export const PrimaryButton = styled(Link)`
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background-color: #6366f1;
  color: white;
  border-radius: 0.25rem;
  font-weight: 500;
  text-align: center;
  text-decoration: none;
  
  &:hover {
    background-color: #4f46e5;
  }
`;

export const SecondaryButton = styled.a`
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background-color: white;
  color: #6366f1;
  border: 1px solid #6366f1;
  border-radius: 0.25rem;
  font-weight: 500;
  text-align: center;
  text-decoration: none;
  
  &:hover {
    background-color: #f9fafb;
  }
`;

export const HeroImage = styled.div`
  display: none;
  
  @media (min-width: 768px) {
    display: block;
    flex: 1;
    max-width: 500px;
  }
`;

export const PhoneImage = styled.img`
  width: 100%;
  height: auto;
  border-radius: 0.5rem;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
`;

// Features Section
export const FeaturesSection = styled.section`
  padding: 4rem 1.5rem;
  background-color: #f9fafb;
  
  @media (min-width: 768px) {
    padding: 6rem 2rem;
  }
`;

export const SectionTitle = styled.h2`
  font-size: 1.875rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 1rem;
  color: #111827;
  
  @media (min-width: 768px) {
    font-size: 2.25rem;
  }
`;

export const SectionDescription = styled.p`
  color: #4b5563;
  font-size: 1rem;
  line-height: 1.5;
  text-align: center;
  margin-bottom: 3rem;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
  
  @media (min-width: 768px) {
    font-size: 1.125rem;
  }
`;

export const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

export const FeatureCard = styled.div`
  background-color: white;
  padding: 2rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  text-align: center;
`;

export const FeatureIcon = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  background-color: #eef2ff;
  color: #6366f1;
  border-radius: 0.5rem;
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
`;

export const FeatureTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: #111827;
`;

export const FeatureDescription = styled.p`
  color: #4b5563;
  font-size: 0.875rem;
  line-height: 1.5;
`;

// How It Works Section
export const HowItWorksSection = styled.section`
  padding: 4rem 1.5rem;
  
  @media (min-width: 768px) {
    padding: 6rem 2rem;
  }
`;

export const StepsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

export const StepCard = styled.div`
  padding: 2rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  text-align: center;
  background-color: white;
`;

export const StepNumber = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  background-color: #6366f1;
  color: white;
  border-radius: 9999px;
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
`;

// CTA Section
export const CTASection = styled.section`
  padding: 4rem 1.5rem;
  background-color: #6366f1;
  color: white;
  text-align: center;
  
  @media (min-width: 768px) {
    padding: 6rem 2rem;
  }
`;

export const CTATitle = styled.h2`
  font-size: 1.875rem;
  font-weight: 700;
  margin-bottom: 1rem;
  
  @media (min-width: 768px) {
    font-size: 2.25rem;
  }
`;

export const CTADescription = styled.p`
  font-size: 1rem;
  line-height: 1.5;
  margin-bottom: 2rem;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
  
  @media (min-width: 768px) {
    font-size: 1.125rem;
  }
`;

export const CTAButton = styled(Link)`
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background-color: white;
  color: #6366f1;
  border-radius: 0.25rem;
  font-weight: 600;
  text-decoration: none;
  
  &:hover {
    background-color: #f9fafb;
  }
`;

// Footer
export const Footer = styled.footer`
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

export const FooterLink = styled.a`
  color: #9ca3af;
  text-decoration: none;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  
  &:hover {
    color: white;
  }
`;

export const Copyright = styled.p`
  text-align: center;
  color: #9ca3af;
  font-size: 0.75rem;
  margin-top: 3rem;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
`;

// Mobile-specific styles
export const MobileContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem 1.5rem;
  text-align: center;
  background-color: #ffffff;
`;

export const MobileLogo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2rem;
  font-size: 1.5rem;
  font-weight: 700;
  color: #6366f1;
`;

export const MobileLogoIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  margin-right: 0.5rem;
  color: #6366f1;
  font-size: 1.25rem;
`;

export const MobileIllustration = styled.img`
  width: 100%;
  max-width: 300px;
  margin-bottom: 2rem;
`;

export const MobileTitle = styled.h1`
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: #111827;
`;

export const MobileTagline = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 2rem;
  font-size: 1.125rem;
  line-height: 1.5;
  color: #4b5563;
`;

export const MobileButton = styled(Link)`
  display: block;
  width: 100%;
  padding: 0.875rem;
  background-color: #6366f1;
  color: white;
  border-radius: 9999px;
  font-weight: 600;
  text-align: center;
  text-decoration: none;
  
  &:hover {
    background-color: #4f46e5;
  }
`;
