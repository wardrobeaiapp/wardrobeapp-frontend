import React from 'react';
import {
  DemoTitle,
  DemoSubtitle,
  FeatureGrid,
  FeatureCard,
  DemoStepsList,
  CTAButton,
  HeroBlock,
  InfoBlock,
  InstructionsBlock,
  CTABlock
} from '../DemoPage.styles';
import { DemoStep } from '../DemoPage';

interface IntroStepProps {
  onNext: () => void;
  markStepCompleted: (step: DemoStep) => void;
}

const IntroStep: React.FC<IntroStepProps> = ({ onNext, markStepCompleted }) => {
  const handleGetStarted = () => {
    markStepCompleted(DemoStep.INTRO);
    onNext();
  };

  return (
    <div>
      {/* Hero Block - Headers and Titles */}
      <HeroBlock>
        <DemoTitle>Stop buying clothes you'll never wear</DemoTitle>
        <DemoSubtitle>
          Meet your AI wardrobe assistant that prevents impulse purchases and saves you money
        </DemoSubtitle>
      </HeroBlock>

      {/* Info Block - What is this app? */}
      <InfoBlock>
        <h2>🛍️ What is this app?</h2>
        <p>
          Your AI wardrobe assistant analyzes every potential purchase against your existing wardrobe, 
          lifestyle, and goals. Instead of encouraging you to buy more, our AI helps you buy smarter by 
          preventing unnecessary purchases and maximizing what you already own.
        </p>
        
        <FeatureGrid>
          <FeatureCard>
            <div className="icon">💰</div>
            <h4>Financial Control</h4>
            <p>Save money by avoiding purchases you'll regret</p>
          </FeatureCard>
          <FeatureCard>
            <div className="icon">🎯</div>
            <h4>Smart Analysis</h4>
            <p>AI analyzes compatibility with your lifestyle & wardrobe</p>
          </FeatureCard>
          <FeatureCard>
            <div className="icon">😌</div>
            <h4>Peace of Mind</h4>
            <p>End shopping anxiety with data-driven decisions</p>
          </FeatureCard>
        </FeatureGrid>
      </InfoBlock>

      {/* Instructions Block - Demo Experience */}
      <InstructionsBlock>
        <h2>📋 Here's what you'll experience:</h2>
        <DemoStepsList>
          <li>
            <div>
              <strong>Choose a persona</strong>
              <span>Pick someone with shopping patterns similar to yours</span>
            </div>
          </li>
          <li>
            <div>
              <strong>Explore their real wardrobe</strong>
              <span>See their actual items, spending stats, and problems</span>
            </div>
          </li>
          <li>
            <div>
              <strong>Watch AI prevent bad purchases</strong>
              <span>See how AI says "no" to items they don't need</span>
            </div>
          </li>
          <li>
            <div>
              <strong>See the transformation</strong>
              <span>Real financial savings and wardrobe efficiency gains</span>
            </div>
          </li>
        </DemoStepsList>
      </InstructionsBlock>

      {/* CTA Block - Call to Action */}
      <CTABlock>
        <CTAButton onClick={handleGetStarted}>
          Start Demo Experience
        </CTAButton>
      </CTABlock>
    </div>
  );
};

export default IntroStep;
