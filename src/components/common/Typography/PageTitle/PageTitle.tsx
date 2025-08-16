import React from 'react';
import styled from 'styled-components';

interface PageTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  align?: 'left' | 'center' | 'right';
  className?: string;
}

const StyledTitle = styled.h1<{ $size: string; $align: string }>`
  font-size: ${({ $size }) => {
    switch ($size) {
      case 'sm':
        return '1.5rem';
      case 'lg':
        return '2rem';
      case 'md':
      default:
        return '1.875rem';
    }
  }};
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 1rem 0;
  text-align: ${({ $align }) => $align};
  line-height: 1.2;
`;

export const PageTitle: React.FC<PageTitleProps> = ({
  children,
  size = 'md',
  align = 'left',
  className = '',
  style,
}) => {
  return (
    <StyledTitle $size={size} $align={align} className={className} style={style}>
      {children}
    </StyledTitle>
  );
};

export default PageTitle;
