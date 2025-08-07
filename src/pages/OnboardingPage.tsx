import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabaseAuth } from '../context/SupabaseAuthContext';
import Header from '../components/Header/Header';
import { useOnboardingState } from '../hooks/useOnboardingState';
import { useOnboardingEventAdapters } from '../hooks/useOnboardingEventAdapters';
import { useOnboardingNavigation } from '../hooks/useOnboardingNavigation';
import OnboardingStepRenderer from '../components/onboarding/OnboardingStepRenderer';

// Import styled components
import {
  OnboardingContainer,
  OnboardingCard,
  ProgressContainer,
  ProgressDot,
  StepContent,
  ButtonContainer,
  BackButton,
  NextButton,
  LoadingMessage
} from './OnboardingPage.styles';
import { PageWrapper } from '../components/Layout.styles';

const OnboardingPage: React.FC = () => {
  const { user, isAuthenticated } = useSupabaseAuth();
  const navigate = useNavigate();
  
  // Get the onboarding state from our custom hook
  const onboardingState = useOnboardingState();
  
  // Use our event adapters hook with the onboarding state
  const eventAdapters = useOnboardingEventAdapters(onboardingState);
  
  // Use our navigation hook with the onboarding state
  const { step, totalSteps, loading, nextStep, prevStep, submitOnboarding } = useOnboardingNavigation(onboardingState);

  // Redirect if not authenticated or already completed onboarding
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    } else if (user?.onboardingCompleted) {
      // Force onboardingCompleted to be true in localStorage before navigating
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      currentUser.onboardingCompleted = true;
      localStorage.setItem('user', JSON.stringify(currentUser));
      
      // Ensure token is present in localStorage
      const token = localStorage.getItem('token');
      if (!token && user) {
        // If we have a user but no token, something is wrong with auth state
        // Try to get token from session storage or cookies as fallback
        const sessionToken = sessionStorage.getItem('token');
        if (sessionToken) {
          localStorage.setItem('token', sessionToken);
        }
      }
      
      // Navigate to home page with replace to avoid history issues
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  // Loading state
  if (loading) {
    return <LoadingMessage>Loading...</LoadingMessage>;
  }

  return (
    <PageWrapper>
      <Header isOnboarding={true} currentStep={step} totalSteps={totalSteps} />
      <OnboardingContainer>
        <ProgressContainer $currentStep={step} $totalSteps={totalSteps}>
          {Array.from({ length: totalSteps }).map((_, index) => (
            <ProgressDot 
              key={index} 
              $active={index + 1 === step} 
              $completed={index + 1 < step} 
            />
          ))}
        </ProgressContainer>
        
        <OnboardingCard>
          <StepContent>
            <OnboardingStepRenderer 
              step={step} 
              onboardingState={onboardingState} 
              eventAdapters={eventAdapters} 
            />
          </StepContent>
          
          <ButtonContainer>
            {step > 1 && (
              <BackButton onClick={prevStep}>
                Back
              </BackButton>
            )}
            
            <NextButton 
              $isComplete={step === totalSteps}
              onClick={() => {
                console.log('DEBUG - Button clicked, step:', step, 'totalSteps:', totalSteps);
                console.log('DEBUG - submitOnboarding reference type:', typeof submitOnboarding);
                
                if (step === totalSteps) {
                  console.log('DEBUG - Complete button clicked, calling submitOnboarding');
                  try {
                    submitOnboarding();
                    console.log('DEBUG - submitOnboarding called successfully');
                  } catch (error) {
                    console.error('DEBUG - Error calling submitOnboarding:', error);
                  }
                } else {
                  console.log('DEBUG - Next button clicked, calling nextStep');
                  nextStep();
                }
              }}
            >
              {step === totalSteps ? 'Complete' : 'Continue'}
            </NextButton>
          </ButtonContainer>
        </OnboardingCard>
      </OnboardingContainer>
    </PageWrapper>
  );
};

export default OnboardingPage;
