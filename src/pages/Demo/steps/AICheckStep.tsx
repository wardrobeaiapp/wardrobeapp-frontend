import React from 'react';
import {
  DemoTitle,
  DemoSubtitle,
  CTAButton,
  HeroBlock,
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
        <DemoTitle>Test the AI Yourself</DemoTitle>
        <DemoSubtitle>
          Try "shopping" for different items and see the instant, data-backed feedback it gives.
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
