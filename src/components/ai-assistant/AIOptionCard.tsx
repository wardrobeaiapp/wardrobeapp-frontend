import React from 'react';
import { OptionCard, OptionTitle, OptionDescription } from '../../pages/AIAssistantPage.styles';

interface AIOptionCardProps {
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
    <OptionCard $active={isActive} onClick={onClick}>
      <OptionTitle>{title}</OptionTitle>
      <OptionDescription>{description}</OptionDescription>
    </OptionCard>
  );
};

export default AIOptionCard;
