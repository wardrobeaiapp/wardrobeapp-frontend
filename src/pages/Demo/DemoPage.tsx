import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  DemoPageContainer,
  StepContent,
  DemoHeader,
  DemoTitle,
  DemoSubtitle,
  IntroSection,
  FeatureGrid,
  FeatureCard,
  DemoStepsList,
  PersonaPreviewGrid,
  PersonaPreviewCard,
  CTAButton,
  HeroBlock,
  InfoBlock,
  InstructionsBlock,
  CTABlock
} from './DemoPage.styles';

// Demo step types
export enum DemoStep {
  INTRO = 'intro',
  PERSONA = 'persona', 
  WARDROBE = 'wardrobe',
  AI_CHECK = 'ai-check',
  RESULTS = 'results',
  WAITLIST = 'waitlist'
}

// Demo step configuration
export interface DemoStepConfig {
  id: DemoStep;
  title: string;
  required: boolean;
}

export const DEMO_STEPS: DemoStepConfig[] = [
  { id: DemoStep.INTRO, title: 'The Problem', required: false },
  { id: DemoStep.PERSONA, title: 'Choose Your Type', required: true },
  { id: DemoStep.WARDROBE, title: 'Wardrobe Reality', required: false },
  { id: DemoStep.AI_CHECK, title: 'AI Prevention', required: false },
  { id: DemoStep.RESULTS, title: 'The Results', required: false },
  { id: DemoStep.WAITLIST, title: 'Get Early Access', required: false }
];

const DemoPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState<DemoStep>(DemoStep.INTRO);
  const [completedSteps, setCompletedSteps] = useState<Set<DemoStep>>(new Set());

  // Initialize step from URL parameter
  useEffect(() => {
    const stepParam = searchParams.get('step');
    if (stepParam && Object.values(DemoStep).includes(stepParam as DemoStep)) {
      setCurrentStep(stepParam as DemoStep);
    }
  }, [searchParams]);

  // Update URL when step changes
  const goToStep = (step: DemoStep) => {
    setCurrentStep(step);
    setSearchParams({ step });
    
    // Track analytics
    console.log('Demo Step:', step);
  };

  // Mark step as completed
  const markStepCompleted = (step: DemoStep) => {
    setCompletedSteps(prev => new Set([...prev, step]));
  };

  // Navigation helpers
  const goToNextStep = () => {
    const currentIndex = DEMO_STEPS.findIndex(s => s.id === currentStep);
    if (currentIndex < DEMO_STEPS.length - 1) {
      goToStep(DEMO_STEPS[currentIndex + 1].id);
    }
  };

  const goToPreviousStep = () => {
    const currentIndex = DEMO_STEPS.findIndex(s => s.id === currentStep);
    if (currentIndex > 0) {
      goToStep(DEMO_STEPS[currentIndex - 1].id);
    }
  };

  // Check if we can progress from current step
  const canProgress = (): boolean => {
    switch (currentStep) {
      case DemoStep.INTRO:
        return true;
      case DemoStep.PERSONA:
        return completedSteps.has(DemoStep.PERSONA);
      case DemoStep.WARDROBE:
        return true;
      case DemoStep.AI_CHECK:
        return completedSteps.has(DemoStep.AI_CHECK);
      case DemoStep.RESULTS:
        return true;
      case DemoStep.WAITLIST:
        return false; // Final step
      default:
        return false;
    }
  };

  // Render current step content
  const renderCurrentStep = () => {
    switch (currentStep) {
      case DemoStep.INTRO:
        return (
          <div>
            {/* Hero Block - Headers and Titles */}
            <HeroBlock>
              <DemoTitle>Stop buying clothes you'll never wear</DemoTitle>
              <DemoSubtitle>
                Meet your AI wardrobe assistant that prevents impulse purchases and saves you money
              </DemoSubtitle>
            </HeroBlock>

            {/* Info Block - What it's about */}
            <InfoBlock>
              <h2>🤖 What is this app?</h2>
              <p>
                Your AI wardrobe assistant analyzes every potential purchase against your existing wardrobe, 
                lifestyle, and goals. Instead of encouraging you to buy more, our AI helps you buy smarter 
                by preventing unnecessary purchases and maximizing what you already own.
              </p>
              
              <FeatureGrid>
                <FeatureCard>
                  <div className="icon">💸</div>
                  <h4>Financial Control</h4>
                  <p>Save money by avoiding purchases you'll regret</p>
                </FeatureCard>
                <FeatureCard>
                  <div className="icon">🎯</div>
                  <h4>Smart Analysis</h4>
                  <p>AI analyzes compatibility with your lifestyle & wardrobe</p>
                </FeatureCard>
                <FeatureCard>
                  <div className="icon">✨</div>
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
                  <strong>Choose a persona</strong>
                  <span>Pick someone with shopping patterns similar to yours</span>
                </li>
                <li>
                  <strong>Explore their real wardrobe</strong>
                  <span>See their actual items, spending stats, and problems</span>
                </li>
                <li>
                  <strong>Watch AI prevent bad purchases</strong>
                  <span>See how AI says "no" to items they don't need</span>
                </li>
                <li>
                  <strong>See the transformation</strong>
                  <span>Real financial savings and wardrobe efficiency gains</span>
                </li>
              </DemoStepsList>
            </InstructionsBlock>

            {/* CTA Block - Call to Action */}
            <CTABlock>
              <CTAButton onClick={() => {
                markStepCompleted(DemoStep.INTRO);
                goToNextStep();
              }}>
                Start Demo Experience
              </CTAButton>
            </CTABlock>
          </div>
        );

      case DemoStep.PERSONA:
        return (
          <div>
            <DemoTitle>Choose your shopping persona</DemoTitle>
            <DemoSubtitle>
              Select the person whose shopping patterns sound most like yours. You'll explore their real wardrobe and see how AI helps them.
            </DemoSubtitle>
            
            <PersonaPreviewGrid>
              <PersonaPreviewCard onClick={() => {
                // TODO: Set selected persona to Sarah
                markStepCompleted(DemoStep.PERSONA);
                goToNextStep();
              }}>
                <div className="persona-type">Impulse Buyer</div>
                <h4>Sarah, 28 - Marketing Coordinator</h4>
                <p>
                  "I buy 3-4 items weekly and my closet is overflowing. I have so many clothes but feel like I have nothing to wear. 
                  I know I should stop but I can't resist when I see something cute!"
                </p>
                <div className="stats">
                  <span>78 items owned</span>
                  <span>Only 23 worn regularly</span>
                  <span>$2,340/year spent</span>
                  <span>$23 avg cost/wear</span>
                </div>
              </PersonaPreviewCard>
              
              <PersonaPreviewCard onClick={() => {
                // TODO: Set selected persona to Mike
                markStepCompleted(DemoStep.PERSONA);
                goToNextStep();
              }}>
                <div className="persona-type">Sale Hunter</div>
                <h4>Mike, 35 - Software Developer</h4>
                <p>
                  "I can't resist a good deal! I buy things 'just in case' and have tons of clothes with tags still on. 
                  My problem isn't the quality - it's that I buy for situations that never happen."
                </p>
                <div className="stats">
                  <span>94 items owned</span>
                  <span>Many unused</span>
                  <span>$1,890/year spent</span>
                  <span>$31 avg cost/wear</span>
                </div>
              </PersonaPreviewCard>
              
              <PersonaPreviewCard onClick={() => {
                // TODO: Set selected persona to Emma
                markStepCompleted(DemoStep.PERSONA);
                goToNextStep();
              }}>
                <div className="persona-type">Aspirational</div>
                <h4>Emma, 32 - Freelance Designer</h4>
                <p>
                  "I buy clothes for the person I want to be, not who I am. Fancy pieces sit unworn while I lack basic everyday items. 
                  I spend too much on 'special occasion' clothes I never wear."
                </p>
                <div className="stats">
                  <span>67 items owned</span>
                  <span>Basics missing</span>
                  <span>$3,120/year spent</span>
                  <span>$41 avg cost/wear</span>
                </div>
              </PersonaPreviewCard>
            </PersonaPreviewGrid>
            
            <div style={{ textAlign: 'center', marginTop: '24px', color: '#6b7280' }}>
              <p>
                👆 Click any persona to explore their wardrobe and see how AI helps them make better decisions
              </p>
            </div>
          </div>
        );

      case DemoStep.WARDROBE:
        return (
          <div>
            <DemoTitle>Their Wardrobe Reality</DemoTitle>
            <DemoSubtitle>Here's what their current wardrobe looks like:</DemoSubtitle>
            
            {/* Wardrobe stats will go here */}
            <div style={{ margin: '40px 0' }}>
              <p><strong>47 tops owned</strong> - only 9 worn regularly</p>
              <p><strong>$2,340 spent this year</strong> - 60% unworn</p>
              <p><strong>Average cost per wear: $23.50</strong></p>
            </div>
            
            <button onClick={goToNextStep}>
              See How AI Prevents Bad Purchases
            </button>
          </div>
        );

      case DemoStep.AI_CHECK:
        return (
          <div>
            <DemoTitle>AI Purchase Prevention in Action</DemoTitle>
            <DemoSubtitle>Watch AI analyze potential purchases:</DemoSubtitle>
            
            {/* Demo items will go here */}
            <div style={{ margin: '40px 0' }}>
              <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                <h4>Trendy Crop Top - $45</h4>
                <p><strong>AI Recommendation: AVOID ⚠️</strong></p>
                <p>You already own 5 similar casual tops that work better with your existing bottoms.</p>
                <p><strong>Estimated cost per wear: $67</strong> (based on your wearing patterns)</p>
              </div>
              
              <button onClick={() => {
                markStepCompleted(DemoStep.AI_CHECK);
                goToNextStep();
              }}>
                See the Results
              </button>
            </div>
          </div>
        );

      case DemoStep.RESULTS:
        return (
          <div>
            <DemoTitle>The Transformation</DemoTitle>
            <DemoSubtitle>Here's what AI discipline achieves:</DemoSubtitle>
            
            <div style={{ margin: '40px 0' }}>
              <h3>Before vs After</h3>
              <p><strong>$400 saved</strong> in 2 months by avoiding 8 purchases</p>
              <p><strong>Cost per wear dropped</strong> from $23 to $8</p>
              <p><strong>Every item now serves 3+ scenarios</strong></p>
            </div>
            
            <button onClick={goToNextStep}>
              Get Early Access
            </button>
          </div>
        );

      case DemoStep.WAITLIST:
        return (
          <div>
            <DemoTitle>Ready to take control?</DemoTitle>
            <DemoSubtitle>Get early access to AI-powered wardrobe control</DemoSubtitle>
            
            <div style={{ margin: '40px 0' }}>
              <input 
                type="email" 
                placeholder="Enter your email" 
                style={{ padding: '12px', borderRadius: '4px', border: '1px solid #ccc', marginRight: '10px' }}
              />
              <button onClick={() => {
                markStepCompleted(DemoStep.WAITLIST);
                alert('Thanks for joining the waitlist!');
              }}>
                Join Waitlist
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <DemoPageContainer>
      <DemoHeader>
        <div style={{ marginBottom: '20px' }}>
          Step {DEMO_STEPS.findIndex(s => s.id === currentStep) + 1} of {DEMO_STEPS.length}
        </div>
        
        {/* Simple step navigation */}
        <div style={{ marginBottom: '20px' }}>
          {currentStep !== DemoStep.INTRO && (
            <button onClick={goToPreviousStep} style={{ marginRight: '10px' }}>
              ← Previous
            </button>
          )}
          
          {canProgress() && currentStep !== DemoStep.WAITLIST && (
            <button onClick={goToNextStep}>
              Next →
            </button>
          )}
        </div>
      </DemoHeader>

      <StepContent>
        {renderCurrentStep()}
      </StepContent>
    </DemoPageContainer>
  );
};

export default DemoPage;
