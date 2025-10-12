import React from 'react';
import {
  DemoTitle,
  DemoSubtitle,
  PersonaPreviewGrid,
  PersonaPreviewCard,
  HeroBlock
} from '../DemoPage.styles';
import { DemoStep } from '../DemoPage';

interface PersonaStepProps {
  onNext: () => void;
  markStepCompleted: (step: DemoStep) => void;
}

const PersonaStep: React.FC<PersonaStepProps> = ({ onNext, markStepCompleted }) => {
  const handlePersonaSelect = () => {
    markStepCompleted(DemoStep.PERSONA);
    onNext();
  };

  return (
    <div>
      <HeroBlock>
        <DemoTitle>Choose your shopping persona</DemoTitle>
        <DemoSubtitle>
          Pick the person whose shopping patterns sound most like yours. You'll explore their 
          real wardrobe and see how AI helps them.
        </DemoSubtitle>
      </HeroBlock>

      <PersonaPreviewGrid>
        <PersonaPreviewCard onClick={handlePersonaSelect}>
          <div className="persona-badge impulse">IMPULSE BUYER</div>
          <h3>Sarah, 28 - Marketing Coordinator</h3>
          <p className="persona-quote">
            "I buy 3-4 items weekly and my closet is overflowing. I have so many 
            clothes but feel like I have nothing to wear. I know I should stop but I can't 
            resist when I see something cute!"
          </p>
          <div className="stats-grid">
            <div className="stat">
              <span className="number">127</span>
              <span className="label">items owned</span>
            </div>
            <div className="stat">
              <span className="number">Only 23</span>
              <span className="label">worn regularly</span>
            </div>
            <div className="stat">
              <span className="number">$2,340/year</span>
              <span className="label">spent</span>
            </div>
            <div className="stat">
              <span className="number">$23 avg</span>
              <span className="label">cost/wear</span>
            </div>
          </div>
        </PersonaPreviewCard>

        <PersonaPreviewCard onClick={handlePersonaSelect}>
          <div className="persona-badge sale">SALE HUNTER</div>
          <h3>Mike, 35 - Software Developer</h3>
          <p className="persona-quote">
            "I can't resist a good deal! I buy things 'just in case' and have tons of 
            clothes with tags still on. My problem isn't the quality - it's that I buy for 
            situations that never happen."
          </p>
          <div className="stats-grid">
            <div className="stat">
              <span className="number">94</span>
              <span className="label">items owned</span>
            </div>
            <div className="stat">
              <span className="number">Many</span>
              <span className="label">unused</span>
            </div>
            <div className="stat">
              <span className="number">$1,890/year</span>
              <span className="label">spent</span>
            </div>
            <div className="stat">
              <span className="number">$31 avg</span>
              <span className="label">cost/wear</span>
            </div>
          </div>
        </PersonaPreviewCard>

        <PersonaPreviewCard onClick={handlePersonaSelect}>
          <div className="persona-badge aspirational">ASPIRATIONAL</div>
          <h3>Emma, 32 - Freelance Designer</h3>
          <p className="persona-quote">
            "I buy clothes for the person I want to be, not who I am. I have gorgeous 
            pieces that don't match my actual lifestyle. I work from home but keep buying 
            office wear!"
          </p>
          <div className="stats-grid">
            <div className="stat">
              <span className="number">68</span>
              <span className="label">items owned</span>
            </div>
            <div className="stat">
              <span className="number">15</span>
              <span className="label">worn regularly</span>
            </div>
            <div className="stat">
              <span className="number">$2,100/year</span>
              <span className="label">spent</span>
            </div>
            <div className="stat">
              <span className="number">$45 avg</span>
              <span className="label">cost/wear</span>
            </div>
          </div>
        </PersonaPreviewCard>
      </PersonaPreviewGrid>
    </div>
  );
};

export default PersonaStep;
