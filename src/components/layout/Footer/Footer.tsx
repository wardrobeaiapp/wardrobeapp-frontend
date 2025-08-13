import React from 'react';
import {
  FooterContainer,
  FooterContent,
  FooterLogo,
  FooterLogoIcon,
  FooterTagline,
  FooterColumn,
  FooterColumnTitle,
  FooterLink,
  Copyright,
  SimpleFooter,
  SimpleFooterContent,
  SimpleFooterLinks,
  SimpleFooterLink
} from './Footer.styles';

interface FooterProps {
  variant?: 'full' | 'simple';
}

const Footer: React.FC<FooterProps> = ({ variant = 'full' }) => {
  const currentYear = new Date().getFullYear();

  if (variant === 'simple') {
    return (
      <SimpleFooter>
        <SimpleFooterContent>
          <div>© {currentYear} WardrobeAI. All rights reserved.</div>
          <SimpleFooterLinks>
            <SimpleFooterLink to="/privacy">Privacy Policy</SimpleFooterLink>
            <SimpleFooterLink to="/terms">Terms of Service</SimpleFooterLink>
            <SimpleFooterLink to="/contact">Contact</SimpleFooterLink>
          </SimpleFooterLinks>
        </SimpleFooterContent>
      </SimpleFooter>
    );
  }

  return (
    <FooterContainer>
      <FooterContent>
        <FooterColumn>
          <FooterLogo>
            <FooterLogoIcon>👔</FooterLogoIcon>
            WardrobeAI
          </FooterLogo>
          <FooterTagline>
            Your personal AI stylist that helps you organize your wardrobe, create outfits, and plan your style calendar.
          </FooterTagline>
        </FooterColumn>

        <FooterColumn>
          <FooterColumnTitle>Product</FooterColumnTitle>
          <FooterLink to="/features">Features</FooterLink>
          <FooterLink to="/pricing">Pricing</FooterLink>
          <FooterLink to="/how-it-works">How It Works</FooterLink>
          <FooterLink to="/faq">FAQ</FooterLink>
        </FooterColumn>

        <FooterColumn>
          <FooterColumnTitle>Company</FooterColumnTitle>
          <FooterLink to="/about">About Us</FooterLink>
          <FooterLink to="/blog">Blog</FooterLink>
          <FooterLink to="/careers">Careers</FooterLink>
          <FooterLink to="/contact">Contact</FooterLink>
        </FooterColumn>

        <FooterColumn>
          <FooterColumnTitle>Legal</FooterColumnTitle>
          <FooterLink to="/privacy">Privacy Policy</FooterLink>
          <FooterLink to="/terms">Terms of Service</FooterLink>
          <FooterLink to="/cookies">Cookie Policy</FooterLink>
        </FooterColumn>
      </FooterContent>

      <Copyright>
        © {currentYear} WardrobeAI. All rights reserved.
      </Copyright>
    </FooterContainer>
  );
};

export default Footer;
