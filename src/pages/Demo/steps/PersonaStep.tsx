import React from 'react';
import {
  DemoTitle,
  DemoSubtitle,
  PersonaPreviewGrid,
  PersonaPreviewCard,
  HeroBlock
} from '../DemoPage.styles';
import { DemoStep } from '../types';
import { trackPersonaSelection } from '../utils/personaUtils';

interface PersonaStepProps {
  onNext: () => void;
  markStepCompleted: (step: DemoStep) => void;
}

interface Persona {
  userId: string;
  name: string;
  title: string;
  description: string;
}

const PERSONAS: Persona[] = [
  {
    userId: '17e17127-60d9-4f7a-b62f-71089efea6ac',
    name: 'Emma',
    title: 'Marketing Manager',
    description: 'Wears business casual outfits for office work and client meetings. Enjoys after-work drinks with colleagues and weekend brunches, travels a few times a year. Building a capsule wardrobe and trying to shop more intentionally.'
  },
  {
    userId: '8a2f9c4e-1b5d-4e7a-9f3c-2d8e5a7b9c1f', 
    name: 'Maya',
    title: 'Freelance Graphic Designer',
    description: 'Needs comfortable home wear that\'s still presentable for Zoom calls and coworking. Loves exploring local cafés and art galleries, works out at the gym regularly. Trying to look more put-together and experiment with her style.'
  },
  {
    userId: 'c5f8d2a9-3e6b-4d7c-8a1f-9e2d5c7b4a6e',
    name: 'Lisa', 
    title: 'Stay-At-Home Mom',
    description: 'Prefers practical clothes that work for both school runs and playground time. Spends time at home with kids, runs errands, occasionally meets friends for coffee. Wants to save money and make getting dressed faster with two kids.'
  },
  {
    userId: '9f3e7b2c-6a4d-4f8e-b9c2-3f7a8d5e9c1b',
    name: 'Zoe',
    title: 'College Student', 
    description: 'Rocks casual everyday looks for classes, part-time café job, and hanging out with friends. Goes to parties, concerts, and social events regularly, loves thrifting on weekends. Looking to define her personal style on a student budget.'
  }
];

const PersonaStep: React.FC<PersonaStepProps> = ({ onNext, markStepCompleted }) => {
  const handlePersonaSelect = (persona: Persona) => {
    // Store selected persona in localStorage
    localStorage.setItem('selectedPersona', JSON.stringify({
      userId: persona.userId,
      name: persona.name,
      title: persona.title,
      selectedAt: new Date().toISOString()
    }));
    
    // Track the selection for analytics/logging
    trackPersonaSelection(persona);
    
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
        {PERSONAS.map((persona) => (
          <PersonaPreviewCard 
            key={persona.userId} 
            onClick={() => handlePersonaSelect(persona)}
            data-user-id={persona.userId}
          >
            <h3>{persona.name} - {persona.title}</h3>
            <p className="persona-quote">
              {persona.description}
            </p>
          </PersonaPreviewCard>
        ))}
      </PersonaPreviewGrid>
    </div>
  );
};

export default PersonaStep;
