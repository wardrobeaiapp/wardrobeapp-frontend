import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { saveDemoProgress, loadDemoProgress, clearDemoProgress } from './utils/demoProgressUtils';
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

  // Initialize step and progress from localStorage or URL parameter
  useEffect(() => {
    const savedProgress = loadDemoProgress();
    const stepParam = searchParams.get('step');
    
    if (savedProgress) {
      // Restore from saved progress
      console.log('🎭 Demo: Restoring saved progress');
      
      // Use URL param if available, otherwise use saved current step
      const targetStep = (stepParam && Object.values(DemoStep).includes(stepParam as DemoStep)) 
        ? stepParam as DemoStep 
        : savedProgress.currentStep;
      
      // Ensure all previous steps up to current step are marked completed
      const targetStepIndex = DEMO_STEPS.findIndex(s => s.id === targetStep);
      const allPreviousCompleted = new Set(savedProgress.completedSteps);
      
      // Mark all steps up to (but not including) current step as completed
      for (let i = 0; i < targetStepIndex; i++) {
        allPreviousCompleted.add(DEMO_STEPS[i].id);
      }
      
      setCompletedSteps(allPreviousCompleted);
      setCurrentStep(targetStep);
      
      console.log(`🎭 Demo: Restored to step '${targetStep}' with ${allPreviousCompleted.size} completed steps`);
      
      // Update URL to match restored step if needed
      if (!stepParam || stepParam !== targetStep) {
        setSearchParams({ step: targetStep });
      }
    } else if (stepParam && Object.values(DemoStep).includes(stepParam as DemoStep)) {
      // Fallback to URL parameter only
      setCurrentStep(stepParam as DemoStep);
    }
  }, [searchParams, setSearchParams]);

  // Auto-save progress when currentStep or completedSteps change
  useEffect(() => {
    // Only save if we have meaningful progress (not initial empty state)
    if (completedSteps.size > 0 || currentStep !== DemoStep.INTRO) {
      saveDemoProgress(currentStep, completedSteps);
    }
  }, [currentStep, completedSteps]);

  // Update URL when step changes (memoized)
  const goToStep = useCallback((step: DemoStep) => {
    setCurrentStep(step);
    setSearchParams({ step });
    
    // Scroll to top when changing steps (especially important on mobile)
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Track analytics
    console.log('Demo Step:', step);
  }, [setSearchParams]);

  // Mark step as completed and ensure all previous steps are also marked completed
  const markStepCompleted = (step: DemoStep) => {
    const stepIndex = DEMO_STEPS.findIndex(s => s.id === step);
    
    setCompletedSteps(prev => {
      const newCompleted = new Set(prev);
      
      // Mark the current step as completed
      newCompleted.add(step);
      
      // Mark all previous steps as completed too
      for (let i = 0; i < stepIndex; i++) {
        newCompleted.add(DEMO_STEPS[i].id);
      }
      
      console.log(`🎭 Demo: Marked step '${step}' and ${stepIndex} previous steps as completed`);
      return newCompleted;
    });
  };

  // Navigation helpers (memoized to prevent dependency array issues)
  const goToNextStep = useCallback(() => {
    const currentIndex = DEMO_STEPS.findIndex(s => s.id === currentStep);
    if (currentIndex < DEMO_STEPS.length - 1) {
      goToStep(DEMO_STEPS[currentIndex + 1].id);
    }
  }, [currentStep, goToStep]);

  const goToPrevStep = useCallback(() => {
    const currentIndex = DEMO_STEPS.findIndex(s => s.id === currentStep);
    if (currentIndex > 0) {
      const prevStep = DEMO_STEPS[currentIndex - 1].id;
      goToStep(prevStep);
      console.log(`🎭 Demo: Navigate back to '${prevStep}'`);
    }
  }, [currentStep, goToStep]);

  // Reset demo progress (useful for testing/development)
  const resetDemo = useCallback(() => {
    clearDemoProgress();
    setCurrentStep(DemoStep.INTRO);
    setCompletedSteps(new Set());
    setSearchParams({ step: DemoStep.INTRO });
    console.log('🎭 Demo: Progress reset');
  }, [setSearchParams]);

  // Expose navigation functions to console for development (optional)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      (window as any).resetDemo = resetDemo;
      (window as any).goToPrevStep = goToPrevStep;
      (window as any).goToNextStep = goToNextStep;
      console.log('🎭 Demo: Development functions available:');
      console.log('  - resetDemo() - Reset demo progress');
      console.log('  - goToPrevStep() - Navigate to previous step');
      console.log('  - goToNextStep() - Navigate to next step');
    }
  }, [resetDemo, goToPrevStep, goToNextStep]);

  // Debug logging for completed steps (development only)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🎭 Demo: Current step:', currentStep);
      console.log('🎭 Demo: Completed steps:', Array.from(completedSteps));
    }
  }, [currentStep, completedSteps]);


  // Render step progress bar
  const renderStepProgressBar = () => {
    const currentIndex = DEMO_STEPS.findIndex(s => s.id === currentStep);
    
    return (
      <StepProgressBar>
        <StepsContainer>
          {DEMO_STEPS.map((step, index) => {
            const isCompleted = completedSteps.has(step.id);
            const isActive = currentStep === step.id;
            const isAccessible = isCompleted || index <= currentIndex; // Allow navigation to current step and all previous steps
            
            return (
              <StepItem
                key={step.id}
                $active={isActive}
                $completed={isCompleted}
                $clickable={isAccessible}
                onClick={() => {
                  // Allow navigation to accessible steps (completed or at/before current step)
                  if (isAccessible) {
                    goToStep(step.id);
                    console.log(`🎭 Demo: User clicked to navigate to step '${step.id}'`);
                  }
                }}
              >
                <StepNumber
                  $active={currentStep === step.id}
                  $completed={completedSteps.has(step.id)}
                >
                  {completedSteps.has(step.id) ? '✓' : index + 1}
                </StepNumber>
                <StepLabel>{step.title}</StepLabel>
              </StepItem>
            );
          })}
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
