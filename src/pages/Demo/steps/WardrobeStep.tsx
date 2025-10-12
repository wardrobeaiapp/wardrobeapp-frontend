import React from 'react';
import {
  DemoTitle,
  DemoSubtitle,
  CTAButton,
  HeroBlock,
  CTABlock
} from '../DemoPage.styles';
import { DemoStep } from '../types';

interface WardrobeStepProps {
  onNext: () => void;
  markStepCompleted: (step: DemoStep) => void;
}

const WardrobeStep: React.FC<WardrobeStepProps> = ({ onNext, markStepCompleted }) => {
  const handleNext = () => {
    markStepCompleted(DemoStep.WARDROBE);
    onNext();
  };

  return (
    <div>
      <HeroBlock>
        <DemoTitle>Wardrobe Reality Check</DemoTitle>
        <DemoSubtitle>
          Let's look at Sarah's real wardrobe data and spending patterns
        </DemoSubtitle>
      </HeroBlock>

      {/* TODO: Add wardrobe visualization content here */}
      <CTABlock>
        <p>Wardrobe analysis content will be implemented here...</p>
        <CTAButton onClick={handleNext}>
          Continue to AI Check
        </CTAButton>
      </CTABlock>
    </div>
  );
};

export default WardrobeStep;
