import React from 'react';
import {
  Card as StyledCard,
  CardHeader,
  CardBody,
  CardFooter,
  CardTitle,
  CardSubtitle,
  CardText,
  CardImage,
  CardVariant,
  CardSize,
  CardPadding
} from './Card.styles';

export interface CardProps {
  children?: React.ReactNode;
  variant?: CardVariant;
  size?: CardSize;
  padding?: CardPadding;
  hoverable?: boolean;
  interactive?: boolean;
  selected?: boolean;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  size = 'md',
  padding = 'md',
  hoverable = false,
  interactive = false,
  selected = false,
  className,
  onClick
}) => {
  return (
    <StyledCard
      $variant={variant}
      $size={size}
      $padding={padding}
      $hoverable={hoverable}
      $interactive={interactive}
      $selected={selected}
      className={className}
      onClick={onClick}
    >
      {children}
    </StyledCard>
  );
};

// Export sub-components for composition
export {
  CardHeader,
  CardBody,
  CardFooter,
  CardTitle,
  CardSubtitle,
  CardText,
  CardImage
};

// Export specialized card variants
export {
  ItemCard,
  FeatureCard,
  AuthCard,
  StatCard,
  ProgressCard
} from './Card.styles';

export default Card;
