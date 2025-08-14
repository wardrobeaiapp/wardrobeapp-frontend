import React from 'react';
import styled from 'styled-components';
import { formTokens } from '../../../styles/tokens/forms';

export interface FormSectionProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  layout?: 'single' | 'double';
  spacing?: 'sm' | 'md' | 'lg';
  className?: string;
  style?: React.CSSProperties;
}

const SectionContainer = styled.div<{ spacing: 'sm' | 'md' | 'lg' }>`
  display: flex;
  flex-direction: column;
  gap: ${props => 
    props.spacing === 'sm' ? formTokens.spacing.lg :
    props.spacing === 'md' ? formTokens.spacing.xl :
    formTokens.spacing.xxl
  };
  width: 100%;
`;

const SectionHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${formTokens.spacing.xs};
`;

const SectionTitle = styled.h3`
  font-size: ${formTokens.typography.fontSizes.lg};
  font-weight: ${formTokens.typography.fontWeights.semibold};
  color: ${formTokens.colors.text};
  margin: 0;
  line-height: ${formTokens.typography.lineHeights.tight};
`;

const SectionSubtitle = styled.p`
  font-size: ${formTokens.typography.fontSizes.sm};
  color: ${formTokens.colors.textMuted};
  margin: 0;
  line-height: ${formTokens.typography.lineHeights.normal};
`;

export const SectionContent = styled.div<{ layout: 'single' | 'double' }>`
  display: ${props => props.layout === 'double' ? 'grid' : 'flex'};
  
  ${props => props.layout === 'double' && `
    grid-template-columns: 1fr 1fr;
    gap: ${formTokens.spacing.lg};
    
    @media (max-width: ${formTokens.form.breakpoints.mobile}) {
      grid-template-columns: 1fr;
    }
  `}
  
  ${props => props.layout === 'single' && `
    flex-direction: column;
    gap: ${formTokens.spacing.lg};
  `}
`;

export const FormSection: React.FC<FormSectionProps> = ({
  title,
  subtitle,
  children,
  layout = 'single',
  spacing = 'md',
  className,
  style
}) => {
  return (
    <SectionContainer spacing={spacing} className={className} style={style}>
      {(title || subtitle) && (
        <SectionHeader>
          {title && <SectionTitle>{title}</SectionTitle>}
          {subtitle && <SectionSubtitle>{subtitle}</SectionSubtitle>}
        </SectionHeader>
      )}
      <SectionContent layout={layout}>
        {children}
      </SectionContent>
    </SectionContainer>
  );
};
