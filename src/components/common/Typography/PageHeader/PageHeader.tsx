import React from 'react';
import styled from 'styled-components';
import { theme } from '../../../../styles/theme';

interface PageHeaderProps {
  title: React.ReactNode;
  description?: string;
  className?: string;
  style?: React.CSSProperties;
  titleSize?: 'sm' | 'md' | 'lg';
  align?: 'left' | 'center' | 'right';
}

const HeaderContainer = styled.div<{ $align: string }>`
  margin-bottom: ${theme.spacing.lg};
  text-align: ${({ $align }) => $align};
`;

const Title = styled.h1<{ $size: 'sm' | 'md' | 'lg'; $align: string }>`
  margin: 0;
  padding: 0;
  font-family: ${theme.typography.fontFamily};
  font-weight: ${theme.typography.fontWeight.bold};
  line-height: 1.2;
  color: ${theme.colors.text};
  text-align: ${({ $align }) => $align};
  
  ${({ $size }) => {
    switch ($size) {
      case 'sm':
        return `
          font-size: ${theme.typography.fontSize.xl};
        `;
      case 'lg':
        return `
          font-size: ${theme.typography.fontSize.xxl};
        `;
      case 'md':
      default:
        return `
          font-size: ${theme.typography.fontSize.xl};
        `;
    }
  }}
`;

const Description = styled.p<{ $align: string }>`
  color: ${theme.colors.textSecondary};
  margin: ${theme.spacing.xs} 0 0 0;
  font-size: ${theme.typography.fontSize.md};
  line-height: 1.5;
  max-width: 700px;
  margin-left: ${({ $align }) => $align === 'center' ? 'auto' : '0'};
  margin-right: ${({ $align }) => $align === 'center' ? 'auto' : '0'};
`;

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  className = '',
  style,
  titleSize = 'md',
  align = 'left',
}) => {
  return (
    <HeaderContainer className={className} style={style} $align={align}>
      <Title $size={titleSize} $align={align}>
        {title}
      </Title>
      {description && (
        <Description $align={align}>
          {description}
        </Description>
      )}
    </HeaderContainer>
  );
};

export default PageHeader;
