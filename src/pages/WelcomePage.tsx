import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/common/Typography/PageHeader';
import {
  PageContainer,
  Header,
  Logo,
  LogoIcon,
  Nav,
  NavLink,
  SignInButton,
  HeroSection,
  HeroContent,
  HeroDescription,
  ButtonGroup,
  PrimaryButton,
  SecondaryButton,
  HeroImage,
  PhoneImage,
  FeaturesSection,
  SectionTitle,
  SectionDescription,
  FeatureGrid,
  FeatureCard,
  FeatureIcon,
  FeatureTitle,
  FeatureDescription,
  HowItWorksSection,
  StepsContainer,
  StepCard,
  StepNumber,
  CTASection,
  CTATitle,
  CTADescription,
  CTAButton,
  Footer,
  FooterContent,
  FooterLogo,
  FooterLogoIcon,
  FooterTagline,
  FooterColumn,
  FooterColumnTitle,
  FooterLink,
  Copyright,
  MobileContainer,
  MobileLogo,
  MobileLogoIcon,
  MobileIllustration,
  MobileTitle,
  MobileTagline,
  MobileButton
} from './WelcomePage.styles';

const WelcomePage: React.FC = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Mobile version
  if (isMobile) {
    return (
      <MobileContainer>
        <MobileLogo>
          <MobileLogoIcon>👔</MobileLogoIcon>
          Wardrobify
        </MobileLogo>
        
        <MobileIllustration 
          src="/wardrobe-illustration.svg" 
          alt="Wardrobify Illustration" 
        />
        
        <MobileTitle>
          Welcome to Wardrobify
        </MobileTitle>
        
        <MobileTagline>
          <span>Dress smarter.</span>
          <span>Buy less.</span>
          <span>Feel better.</span>
        </MobileTagline>
        
        <MobileButton to="/register">
          Get Started
        </MobileButton>
      </MobileContainer>
    );
  }
  
  // Desktop version
  return (
    <PageContainer>
      <Header>
        <Logo>
          <LogoIcon>👔</LogoIcon>
          Sharni
        </Logo>
        <Nav>
          <NavLink href="#features">Features</NavLink>
          <NavLink href="#how-it-works">How It Works</NavLink>
          <NavLink href="#pricing">Pricing</NavLink>
        </Nav>
        <SignInButton to="/login">Sign In</SignInButton>
      </Header>
      
      <HeroSection>
        <HeroContent>
          <PageHeader 
            title="Your Personal AI Stylist"
            titleSize="lg"
            style={{ 
              fontSize: '3rem',
              lineHeight: '1.2',
              marginBottom: '1rem',
              color: 'white'
            }}
          />
          <HeroDescription>
            Transform your wardrobe with AI-powered insights. Discover
            what you already own, get personalized outfit suggestions,
            and make smarter fashion choices.
          </HeroDescription>
          <ButtonGroup>
            <PrimaryButton to="/register">Get Started</PrimaryButton>
            <SecondaryButton href="#how-it-works">Watch Demo</SecondaryButton>
          </ButtonGroup>
        </HeroContent>
        <HeroImage>
          <PhoneImage src="/app-screenshot.png" alt="Sharni App Screenshot" />
        </HeroImage>
      </HeroSection>
      
      <FeaturesSection id="features">
        <SectionTitle>Why Choose Sharni?</SectionTitle>
        <SectionDescription>
          Our intelligent platform helps you make the most of your existing wardrobe
          while reducing unnecessary purchases.
        </SectionDescription>
        <FeatureGrid>
          <FeatureCard>
            <FeatureIcon>🔍</FeatureIcon>
            <FeatureTitle>Smart Analysis</FeatureTitle>
            <FeatureDescription>
              AI-powered analysis of your wardrobe to identify gaps, duplicates, and optimize
              your clothing collection.
            </FeatureDescription>
          </FeatureCard>
          <FeatureCard>
            <FeatureIcon>👕</FeatureIcon>
            <FeatureTitle>Outfit Suggestions</FeatureTitle>
            <FeatureDescription>
              Get personalized outfit recommendations based on your style preferences,
              weather, and occasions.
            </FeatureDescription>
          </FeatureCard>
          <FeatureCard>
            <FeatureIcon>🌱</FeatureIcon>
            <FeatureTitle>Sustainable Fashion</FeatureTitle>
            <FeatureDescription>
              Reduce fashion waste by maximizing the use of clothes you already own and
              making conscious purchases.
            </FeatureDescription>
          </FeatureCard>
        </FeatureGrid>
      </FeaturesSection>
      
      <HowItWorksSection id="how-it-works">
        <SectionTitle>How It Works</SectionTitle>
        <SectionDescription>
          Three simple steps to transform your wardrobe experience
        </SectionDescription>
        <StepsContainer>
          <StepCard>
            <StepNumber>1</StepNumber>
            <FeatureTitle>Upload Your Clothes</FeatureTitle>
            <FeatureDescription>
              Take photos of your clothing items or upload existing images to build your digital wardrobe.
            </FeatureDescription>
          </StepCard>
          <StepCard>
            <StepNumber>2</StepNumber>
            <FeatureTitle>AI Analysis</FeatureTitle>
            <FeatureDescription>
              Our AI categorizes your items, identifies your style, and analyzes your wardrobe composition.
            </FeatureDescription>
          </StepCard>
          <StepCard>
            <StepNumber>3</StepNumber>
            <FeatureTitle>Get Recommendations</FeatureTitle>
            <FeatureDescription>
              Receive personalized outfit suggestions and smart shopping recommendations.
            </FeatureDescription>
          </StepCard>
        </StepsContainer>
      </HowItWorksSection>
      
      <CTASection>
        <CTATitle>Ready to Transform Your Wardrobe?</CTATitle>
        <CTADescription>
          Join thousands of users who have already optimized their wardrobes and reduced
          their fashion footprint.
        </CTADescription>
        <CTAButton to="/register">Get Started Free</CTAButton>
      </CTASection>
      
      <Footer>
        <FooterContent>
          <FooterColumn>
            <FooterLogo>
              <FooterLogoIcon>👔</FooterLogoIcon>
              Sharni
            </FooterLogo>
            <FooterTagline>Dress smarter. Buy less. Feel better.</FooterTagline>
          </FooterColumn>
          <FooterColumn>
            <FooterColumnTitle>Product</FooterColumnTitle>
            <FooterLink href="#">Features</FooterLink>
            <FooterLink href="#">Pricing</FooterLink>
            <FooterLink href="#">Careers</FooterLink>
          </FooterColumn>
          <FooterColumn>
            <FooterColumnTitle>Company</FooterColumnTitle>
            <FooterLink href="#">About</FooterLink>
            <FooterLink href="#">Blog</FooterLink>
            <FooterLink href="#">Careers</FooterLink>
          </FooterColumn>
          <FooterColumn>
            <FooterColumnTitle>Support</FooterColumnTitle>
            <FooterLink href="#">Help Center</FooterLink>
            <FooterLink href="#">Contact</FooterLink>
            <FooterLink href="#">Privacy</FooterLink>
          </FooterColumn>
        </FooterContent>
        <Copyright>© 2025 Sharni. All rights reserved.</Copyright>
      </Footer>
    </PageContainer>
  );
};

export default WelcomePage;
