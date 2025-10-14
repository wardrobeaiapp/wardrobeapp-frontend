import React, { useEffect, useState } from 'react';
import {
  DemoTitle,
  DemoSubtitle,
  CTAButton,
  HeroBlock,
  CTABlock
} from '../DemoPage.styles';
import { DemoStep } from '../types';
import { getSelectedPersona, SelectedPersona } from '../utils/personaUtils';

interface WardrobeStepProps {
  onNext: () => void;
  markStepCompleted: (step: DemoStep) => void;
}

const WardrobeStep: React.FC<WardrobeStepProps> = ({ onNext, markStepCompleted }) => {
  const [selectedPersona, setSelectedPersona] = useState<SelectedPersona | null>(null);

  useEffect(() => {
    const persona = getSelectedPersona();
    setSelectedPersona(persona);
    
    if (persona) {
      console.log('Current persona in wardrobe step:', persona);
    }
  }, []);

  const handleNext = () => {
    markStepCompleted(DemoStep.WARDROBE);
    onNext();
  };

  const personaName = selectedPersona?.name || 'your selected persona';

  return (
    <div>
      <HeroBlock>
        <DemoTitle>Explore {personaName}'s Wardrobe</DemoTitle>
        <DemoSubtitle>
          Let's look at {personaName}'s real wardrobe data and spending patterns
        </DemoSubtitle>
      </HeroBlock>

      {/* TODO: Add wardrobe visualization content here */}
      <CTABlock>
        <p>Wardrobe analysis content for {personaName} will be implemented here...</p>
        {selectedPersona && (
          <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '10px' }}>
            Selected: {selectedPersona.name} ({selectedPersona.title}) - User ID: {selectedPersona.userId}
          </p>
        )}
        <CTAButton onClick={handleNext}>
          Continue to AI Check
        </CTAButton>
      </CTABlock>
    </div>
  );
};

export default WardrobeStep;
