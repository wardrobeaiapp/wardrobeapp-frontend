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
import { DemoStep } from '../types';

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
        <DemoTitle>The First App That Tells You What NOT to Buy</DemoTitle>
        <DemoSubtitle>
          Get personalized advice on every potential purchase. Our AI analyzes your wardrobe and lifestyle to show you what works, what doesn't, and why.
        </DemoSubtitle>
      </HeroBlock>

      {/* Info Block - How It Works? */}
      <InfoBlock>
        <h2>🛍️ What Does This App Do?</h2>
        <p>
          Imagine getting honest feedback before every purchase: does this item truly work with your existing wardrobe, do you already own something similar, does it fit your actual lifestyle?
        </p>
        <p>
          Think of our app as your thoughtful friend in the fitting room. It notices what you might have missed, helping you make confident decisions you won't regret later.
        </p>
        
        <FeatureGrid>
          <FeatureCard>
            <div className="icon">💰</div>
            <h4>Save Your Money</h4>
            <p>Stop wasting money on clothes you'll never wear. Watch your budget grow as you skip unnecessary purchases.</p>
          </FeatureCard>
          <FeatureCard>
            <div className="icon">🏠</div>
            <h4>Save Your Space</h4>
            <p>Reclaim your closet from clutter and chaos. Build a curated collection where every item deserves its place.</p>
          </FeatureCard>
          <FeatureCard>
            <div className="icon">🎯</div>
            <h4>Shop with Certainty</h4>
            <p>Make every purchase with total confidence. Know you're buying only what works for your life and style.</p>
          </FeatureCard>
          <FeatureCard>
            <div className="icon">😌</div>
            <h4>A Wardrobe That Works</h4>
            <p>Finally have a closet that supports your daily life. Experience the ease of getting dressed when every piece fits your needs.</p>
          </FeatureCard>
        </FeatureGrid>
      </InfoBlock>

      {/* Instructions Block - Demo Experience */}
      <InstructionsBlock>
        <h2>📋 See how it works in 3 simple steps:</h2>
        <DemoStepsList>
          <li>
            <div>
              <strong>Choose Your Demo Persona</strong>
              <span>Find someone with a lifestyle or shopping habits like yours</span>
            </div>
          </li>
          <li>
            <div>
              <strong>Peek Into Their Organized Closet</strong>
              <span>Explore their actual wardrobe, budget, and style goals</span>
            </div>
          </li>
          <li>
            <div>
              <strong>See Your Style Advisor Work</strong>
              <span>Experiment with different items and get instant, data-backed feedback</span>
            </div>
          </li>
        </DemoStepsList>
      </InstructionsBlock>

      {/* CTA Block - Call to Action */}
      <CTABlock>
        <CTAButton onClick={handleGetStarted}>
          Try the Interactive Demo
        </CTAButton>
      </CTABlock>
    </div>
  );
};

export default IntroStep;
