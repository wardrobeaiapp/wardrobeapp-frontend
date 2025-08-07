import React from 'react';
import { Card, Title, Description } from './AIOptionCard.styles';

export interface AIOptionCardProps {
  title: string;
  description: string;
  isActive: boolean;
  onClick: () => void;
}

const AIOptionCard: React.FC<AIOptionCardProps> = ({ 
  title, 
  description, 
  isActive, 
  onClick 
}) => {
  return (
    <Card $active={isActive} onClick={onClick}>
      <Title>{title}</Title>
      <Description>{description}</Description>
    </Card>
  );
};

export default AIOptionCard;
