import React from 'react';
import {
  DemoTitle,
  DemoSubtitle,
  CTAButton,
  HeroBlock,
  CTABlock
} from '../DemoPage.styles';
import { DemoStep } from '../types';

interface AICheckStepProps {
  onNext: () => void;
  markStepCompleted: (step: DemoStep) => void;
}

const AICheckStep: React.FC<AICheckStepProps> = ({ onNext, markStepCompleted }) => {
  const handleNext = () => {
    markStepCompleted(DemoStep.AI_CHECK);
    onNext();
  };

  return (
    <div>
      <HeroBlock>
        <DemoTitle>AI Prevention in Action</DemoTitle>
        <DemoSubtitle>
          Watch how AI analyzes potential purchases and prevents bad decisions
        </DemoSubtitle>
        <CTAButton onClick={handleNext}>
          Get Early Access
        </CTAButton>
      </HeroBlock>
      
      {/* TODO: Add AI check simulation content here */}
    </div>
  );
};

export default AICheckStep;
