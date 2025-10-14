import React from 'react';
import {
  DemoTitle,
  DemoSubtitle,
  PersonaPreviewGrid,
  PersonaPreviewCard,
  HeroBlock
} from '../DemoPage.styles';
import { DemoStep } from '../types';

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
        <DemoTitle>Find Your Lifestyle Match</DemoTitle>
        <DemoSubtitle>
          Choose a persona whose daily life, work, and habits resonate with you. Their needs and scenarios will shape the AI's advice.
        </DemoSubtitle>
      </HeroBlock>

      <PersonaPreviewGrid>
        <PersonaPreviewCard onClick={handlePersonaSelect}>
          <h3>Emma - Marketing manager</h3>
          <p className="persona-quote">
            Wears business casual outfits for office work and client meetings.
            Enjoys after-work drinks with colleagues and weekend brunches, travels a few times a year.
          </p>
        </PersonaPreviewCard>

        <PersonaPreviewCard onClick={handlePersonaSelect}>
          <h3>Maya - Freelance graphic designer</h3>
          <p className="persona-quote">
            Needs comfortable home wear that's still presentable for Zoom calls and coworking.
            Loves exploring local cafés and art galleries, works out at the gym regularly.
          </p>
        </PersonaPreviewCard>

        <PersonaPreviewCard onClick={handlePersonaSelect}>
          <h3>Lisa - Stay-at-home mom</h3>
          <p className="persona-quote">
            Prefers practical clothes that work for both school runs and playground time.
            Spends time at home with kids, runs errands, occasionally meets friends for coffee.
          </p>
        </PersonaPreviewCard>

        <PersonaPreviewCard onClick={handlePersonaSelect}>
          <h3>Zoe - College student</h3>
          <p className="persona-quote">
            Rocks casual everyday looks for classes, part-time café job, and hanging out with friends.
            Goes to parties, concerts, and social events regularly, loves thrifting on weekends.
          </p>
        </PersonaPreviewCard>
      </PersonaPreviewGrid>
    </div>
  );
};

export default PersonaStep;
