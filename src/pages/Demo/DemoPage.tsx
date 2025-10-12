import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  DemoPageContainer,
  StepContent,
  DemoHeader,
  DemoTitle,
  DemoSubtitle
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
            <DemoTitle>Stop buying clothes you'll never wear</DemoTitle>
            <DemoSubtitle>
              Join thousands who've taken control of their wardrobe spending with AI-powered purchase prevention
            </DemoSubtitle>
            <button onClick={() => {
              markStepCompleted(DemoStep.INTRO);
              goToNextStep();
            }}>
              See How It Works
            </button>
          </div>
        );

      case DemoStep.PERSONA:
        return (
          <div>
            <DemoTitle>What's your overconsumption pattern?</DemoTitle>
            <DemoSubtitle>Choose the type that sounds most like you:</DemoSubtitle>
            
            {/* Persona cards will go here */}
            <div style={{ display: 'flex', gap: '20px', margin: '40px 0' }}>
              <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', cursor: 'pointer' }}
                onClick={() => {
                  markStepCompleted(DemoStep.PERSONA);
                  goToNextStep();
                }}>
                <h3>Impulse Buyer Sarah</h3>
                <p>Buys 3-4 items weekly, closet overflowing</p>
              </div>
              
              <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', cursor: 'pointer' }}
                onClick={() => {
                  markStepCompleted(DemoStep.PERSONA);
                  goToNextStep();
                }}>
                <h3>Sale Hunter Mike</h3>
                <p>Can't resist discounts, buys "just in case"</p>
              </div>
              
              <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', cursor: 'pointer' }}
                onClick={() => {
                  markStepCompleted(DemoStep.PERSONA);
                  goToNextStep();
                }}>
                <h3>Aspirational Emma</h3>
                <p>Buys for imaginary lifestyle, not current reality</p>
              </div>
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
