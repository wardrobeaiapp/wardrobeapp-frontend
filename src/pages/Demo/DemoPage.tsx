import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  DemoPageWrapper,
  DemoPageContainer,
  StepContent,
  StepProgressBar,
  StepsContainer,
  StepItem,
  StepNumber,
  StepLabel
} from './DemoPage.styles';
import {
  IntroStep,
  PersonaStep,
  WardrobeStep,
  AICheckStep,
  WaitlistStep
} from './steps';
import { DemoStep, DEMO_STEPS } from './types';

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


  // Render step progress bar
  const renderStepProgressBar = () => {
    return (
      <StepProgressBar>
        <StepsContainer>
          {DEMO_STEPS.map((step, index) => (
            <StepItem
              key={step.id}
              active={currentStep === step.id}
              completed={completedSteps.has(step.id)}
              clickable={completedSteps.has(step.id)}
              onClick={() => {
                // Allow navigation to completed steps
                if (completedSteps.has(step.id)) {
                  goToStep(step.id);
                }
              }}
            >
              <StepNumber
                active={currentStep === step.id}
                completed={completedSteps.has(step.id)}
              >
                {completedSteps.has(step.id) ? '✓' : index + 1}
              </StepNumber>
              <StepLabel>{step.title}</StepLabel>
            </StepItem>
          ))}
        </StepsContainer>
      </StepProgressBar>
    );
  };

  // Render current step content
  const renderCurrentStep = () => {
    switch (currentStep) {
      case DemoStep.INTRO:
        return (
          <IntroStep 
            onNext={goToNextStep}
            markStepCompleted={markStepCompleted}
          />
        );

      case DemoStep.PERSONA:
        return (
          <PersonaStep 
            onNext={goToNextStep}
            markStepCompleted={markStepCompleted}
          />
        );

      case DemoStep.WARDROBE:
        return (
          <WardrobeStep 
            onNext={goToNextStep}
            markStepCompleted={markStepCompleted}
          />
        );

      case DemoStep.AI_CHECK:
        return (
          <AICheckStep 
            onNext={goToNextStep}
            markStepCompleted={markStepCompleted}
          />
        );

      case DemoStep.WAITLIST:
        return (
          <WaitlistStep 
            markStepCompleted={markStepCompleted}
          />
        );

      default:
        return null;
    }
  };

  return (
    <DemoPageWrapper>
      {renderStepProgressBar()}
      
      <DemoPageContainer>
        <StepContent>
          {renderCurrentStep()}
        </StepContent>
      </DemoPageContainer>
    </DemoPageWrapper>
  );
};

export default DemoPage;
