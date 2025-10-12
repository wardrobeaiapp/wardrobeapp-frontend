import React from 'react';
import {
  DemoTitle,
  DemoSubtitle,
  CTAButton,
  HeroBlock,
  CTABlock
} from '../DemoPage.styles';
import { DemoStep } from '../DemoPage';

interface ResultsStepProps {
  onNext: () => void;
  markStepCompleted: (step: DemoStep) => void;
}

const ResultsStep: React.FC<ResultsStepProps> = ({ onNext, markStepCompleted }) => {
  const handleNext = () => {
    markStepCompleted(DemoStep.RESULTS);
    onNext();
  };

  return (
    <div>
      <HeroBlock>
        <DemoTitle>The Transformation Results</DemoTitle>
        <DemoSubtitle>
          See the real financial savings and wardrobe efficiency gains
        </DemoSubtitle>
      </HeroBlock>

      {/* TODO: Add results visualization content here */}
      <CTABlock>
        <p>Results and transformation data will be implemented here...</p>
        <CTAButton onClick={handleNext}>
          Get Early Access
        </CTAButton>
      </CTABlock>
    </div>
  );
};

export default ResultsStep;
