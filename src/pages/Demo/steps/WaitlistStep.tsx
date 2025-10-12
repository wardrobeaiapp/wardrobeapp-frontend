import React from 'react';
import {
  DemoTitle,
  DemoSubtitle,
  CTAButton,
  HeroBlock,
  CTABlock
} from '../DemoPage.styles';
import { DemoStep } from '../DemoPage';

interface WaitlistStepProps {
  markStepCompleted: (step: DemoStep) => void;
}

const WaitlistStep: React.FC<WaitlistStepProps> = ({ markStepCompleted }) => {
  const handleJoinWaitlist = () => {
    markStepCompleted(DemoStep.WAITLIST);
    // TODO: Implement waitlist signup logic
  };

  return (
    <div>
      <HeroBlock>
        <DemoTitle>Get Early Access</DemoTitle>
        <DemoSubtitle>
          Join the waitlist to be the first to experience your AI wardrobe assistant
        </DemoSubtitle>
      </HeroBlock>

      {/* TODO: Add waitlist signup form here */}
      <CTABlock>
        <p>Waitlist signup form will be implemented here...</p>
        <CTAButton onClick={handleJoinWaitlist}>
          Join Waitlist
        </CTAButton>
      </CTABlock>
    </div>
  );
};

export default WaitlistStep;
