import React, { useState, useEffect } from 'react';
import {
  DemoTitle,
  DemoSubtitle,
  HeroBlock,
  InfoBlock,
  FeatureGrid,
  FeatureCard,
  SuccessEmoji,
  SuccessMessage,
  WaitlistTitle,
  WaitlistDescription,
  WaitlistForm,
  InputContainer,
  EmailInput,
  SubmitButton,
  ErrorMessage,
  PrivacyText
} from '../DemoPage.styles';
import { DemoStep } from '../types';
import { getApiUrl, API_ENDPOINTS } from '../../../config/api';

interface WaitlistStepProps {
  markStepCompleted: (step: DemoStep) => void;
}

const WaitlistStep: React.FC<WaitlistStepProps> = ({ markStepCompleted }) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Try Email Octopus through server API
  const handleEmailOctopusSubmit = async (email: string) => {
    try {
      console.log('🚀 Attempting submission to:', getApiUrl(API_ENDPOINTS.WAITLIST));
      
      // Use our waitlist endpoint which includes Email Octopus integration
      const response = await fetch(getApiUrl(API_ENDPOINTS.WAITLIST), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      console.log('📡 Response status:', response.status);
      
      // Check if we got HTML instead of JSON (indicates 404 or server error)
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
        console.error('❌ Got HTML instead of JSON - function not deployed');
        throw new Error('Waitlist service is not available yet. Please try again later.');
      }

      const data = await response.json();

      if (response.ok) {
        return { success: true, data };
      } else if (response.status === 409) {
        // Already subscribed
        return { success: true, data: { message: 'Already subscribed' } };
      } else {
        throw new Error(data.message || 'Failed to subscribe');
      }
    } catch (error) {
      console.error('Waitlist API error:', error);
      return { success: false, error };
    }
  };

  const handleJoinWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setErrorMessage('Please enter your email address');
      setSubmitStatus('error');
      return;
    }

    if (!validateEmail(email)) {
      setErrorMessage('Please enter a valid email address');
      setSubmitStatus('error');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    
    try {
      // Submit to our waitlist API (which includes Email Octopus integration)
      const result = await handleEmailOctopusSubmit(email);
      
      if (result.success) {
        setSubmitStatus('success');
        markStepCompleted(DemoStep.WAITLIST);
        
        // Track analytics
        console.log('Waitlist signup successful:', { email });
      } else {
        throw new Error('Failed to join waitlist');
      }
      
    } catch (error: unknown) {
      console.error('Waitlist signup error:', error);
      let errorMsg = 'Failed to join waitlist. Please try again.';
      
      if (error instanceof Error) {
        errorMsg = error.message;
      } else if (typeof error === 'string') {
        errorMsg = error;
      }
      
      setErrorMessage(errorMsg);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    // Clean up any previous errors when component mounts
    setErrorMessage('');
    setSubmitStatus('idle');
  }, []);

  if (submitStatus === 'success') {
    return (
      <div>
        <HeroBlock>
          <SuccessEmoji>🎉</SuccessEmoji>
          <DemoTitle>You're on the list!</DemoTitle>
          <DemoSubtitle>
            Thank you for joining our waitlist. We'll notify you as soon as Sharni is ready for early access.
          </DemoSubtitle>
          <SuccessMessage>
            Check your email for confirmation details
          </SuccessMessage>
        </HeroBlock>
      </div>
    );
  }

  return (
    <div>
      <HeroBlock>
        <DemoTitle>Get Early Access</DemoTitle>
        <DemoSubtitle>
          Join the waitlist to be the first to experience the full app.
        </DemoSubtitle>
      </HeroBlock>

      <InfoBlock>
        <h2>🚀 This Is Just The Beginning</h2>
        <FeatureGrid>
          <FeatureCard>
            <div className="icon">🎯</div>
            <h4>Your Personal Shopping Strategy</h4>
            <p>Go beyond single checks. Set long-term purchase limits (e.g., "1 item per month") and track your progress.</p>
          </FeatureCard>
          
          <FeatureCard>
            <div className="icon">📈</div>
            <h4>Total Financial Clarity</h4>
            <p>See exactly what you're saving and spending on clothes over time. Turn abstract goals into tangible results.</p>
          </FeatureCard>
          
          <FeatureCard>
            <div className="icon">🔍</div>
            <h4>Your Wardrobe's Missing Pieces</h4>
            <p>Not sure what to buy? Get AI-powered recommendations on exactly which items would best complement your existing closet.</p>
          </FeatureCard>
          
          <FeatureCard>
            <div className="icon">👗</div>
            <h4>Effortless Outfit Planning</h4>
            <p>Create and save full outfits or entire seasonal capsules from your digital wardrobe. Plan your looks directly in the calendar.</p>
          </FeatureCard>
        </FeatureGrid>
      </InfoBlock>

      <HeroBlock>
        <WaitlistTitle>
          Join the Waitlist
        </WaitlistTitle>
        <WaitlistDescription>
          Enter your email to get notified when Sharni launches and be the first to experience smarter shopping.
        </WaitlistDescription>

        <WaitlistForm onSubmit={handleJoinWaitlist}>
          <InputContainer>
            <EmailInput
              type="email"
              placeholder="Enter your email address"
              value={email}
              $hasError={submitStatus === 'error'}
              onChange={(e) => {
                setEmail(e.target.value);
                if (submitStatus === 'error') {
                  setSubmitStatus('idle');
                  setErrorMessage('');
                }
              }}
              disabled={isSubmitting}
            />
            <SubmitButton 
              type="submit" 
              disabled={isSubmitting}
              $isSubmitting={isSubmitting}
            >
              {isSubmitting ? 'Joining...' : 'Join Waitlist'}
            </SubmitButton>
          </InputContainer>
          
          {submitStatus === 'error' && (
            <ErrorMessage>
              {errorMessage}
            </ErrorMessage>
          )}
          
          <PrivacyText>
            We respect your privacy. No spam, unsubscribe anytime.
          </PrivacyText>
        </WaitlistForm>
      </HeroBlock>
    </div>
  );
};

export default WaitlistStep;
