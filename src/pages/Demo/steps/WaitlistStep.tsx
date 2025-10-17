import React, { useState } from 'react';
import {
  DemoTitle,
  DemoSubtitle,
  CTAButton,
  HeroBlock,
  CTABlock,
  InfoBlock,
  FeatureGrid,
  FeatureCard
} from '../DemoPage.styles';
import { DemoStep } from '../types';

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
      // Make API call to waitlist endpoint
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to join waitlist');
      }

      setSubmitStatus('success');
      markStepCompleted(DemoStep.WAITLIST);
      
      // Track analytics
      console.log('Waitlist signup successful:', {
        email,
        position: data.data?.position,
        estimated_launch: data.data?.estimated_launch
      });
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

  if (submitStatus === 'success') {
    return (
      <div>
        <HeroBlock>
          <div style={{ fontSize: '4rem', marginBottom: '24px' }}>🎉</div>
          <DemoTitle>You're on the list!</DemoTitle>
          <DemoSubtitle>
            Thank you for joining our waitlist. We'll notify you as soon as WardrobeAI is ready for early access.
          </DemoSubtitle>
          <p style={{ color: '#059669', fontWeight: '600', fontSize: '1.1rem', marginTop: '20px' }}>
            Check your email for confirmation details
          </p>
        </HeroBlock>
      </div>
    );
  }

  return (
    <div>
      <HeroBlock>
        <DemoTitle>Get Early Access</DemoTitle>
        <DemoSubtitle>
          Be among the first to transform your wardrobe with AI-powered insights. 
          Join thousands who are already on the waitlist for smarter fashion choices.
        </DemoSubtitle>
      </HeroBlock>

      <InfoBlock>
        <h2>🚀 What You'll Get with WardrobeAI</h2>
        <FeatureGrid>
          <FeatureCard>
            <div className="icon">🧠</div>
            <h4>Smart Wardrobe Analysis</h4>
            <p>AI-powered analysis identifies gaps, duplicates, and optimization opportunities in your wardrobe collection.</p>
          </FeatureCard>
          
          <FeatureCard>
            <div className="icon">✨</div>
            <h4>Personalized Outfit Suggestions</h4>
            <p>Get curated outfit combinations based on your style preferences, weather, and upcoming occasions.</p>
          </FeatureCard>
          
          <FeatureCard>
            <div className="icon">📱</div>
            <h4>Digital Wardrobe Management</h4>
            <p>Organize and categorize all your clothing items with photos, tags, and smart organization features.</p>
          </FeatureCard>
          
          <FeatureCard>
            <div className="icon">🌱</div>
            <h4>Sustainable Fashion Insights</h4>
            <p>Reduce fashion waste by maximizing the use of existing items and making conscious purchase decisions.</p>
          </FeatureCard>
          
          <FeatureCard>
            <div className="icon">🎯</div>
            <h4>Scenario-Based Planning</h4>
            <p>Plan outfits for specific scenarios like work, social events, or travel with AI-curated suggestions.</p>
          </FeatureCard>
          
          <FeatureCard>
            <div className="icon">📊</div>
            <h4>Style Analytics</h4>
            <p>Discover your style patterns, color preferences, and get insights on how to enhance your personal brand.</p>
          </FeatureCard>
        </FeatureGrid>
      </InfoBlock>

      <HeroBlock>
        <h2 style={{ fontSize: '2rem', marginBottom: '16px', color: '#1f2937' }}>
          Join the Waitlist
        </h2>
        <p style={{ fontSize: '1.1rem', color: '#6b7280', marginBottom: '32px', lineHeight: '1.6' }}>
          Enter your email to get notified when WardrobeAI launches. Early access members will get:
        </p>
        <div style={{ textAlign: 'left', marginBottom: '32px', maxWidth: '400px', margin: '0 auto 32px' }}>
          <ul style={{ color: '#4b5563', fontSize: '1rem', lineHeight: '1.8' }}>
            <li>✅ <strong>Free premium features</strong> for the first 3 months</li>
            <li>✅ <strong>Priority support</strong> and direct feedback channel</li>
            <li>✅ <strong>Exclusive tutorials</strong> and styling tips</li>
            <li>✅ <strong>Early access</strong> to new AI features</li>
          </ul>
        </div>

        <form onSubmit={handleJoinWaitlist} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (submitStatus === 'error') {
                  setSubmitStatus('idle');
                  setErrorMessage('');
                }
              }}
              disabled={isSubmitting}
              style={{
                padding: '16px 20px',
                border: submitStatus === 'error' ? '2px solid #dc2626' : '2px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '16px',
                width: '320px',
                maxWidth: '100%',
                outline: 'none',
                transition: 'all 0.2s'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#4f46e5';
                e.target.style.boxShadow = '0 0 0 3px rgba(79, 70, 229, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = submitStatus === 'error' ? '#dc2626' : '#e5e7eb';
                e.target.style.boxShadow = 'none';
              }}
            />
            <CTAButton 
              type="submit" 
              disabled={isSubmitting}
              style={{
                opacity: isSubmitting ? 0.7 : 1,
                cursor: isSubmitting ? 'not-allowed' : 'pointer'
              }}
            >
              {isSubmitting ? 'Joining...' : 'Join Waitlist'}
            </CTAButton>
          </div>
          
          {submitStatus === 'error' && (
            <p style={{ color: '#dc2626', fontSize: '0.9rem', margin: '8px 0 0', textAlign: 'center' }}>
              {errorMessage}
            </p>
          )}
          
          <p style={{ fontSize: '0.85rem', color: '#9ca3af', margin: '8px 0 0', textAlign: 'center' }}>
            We respect your privacy. No spam, unsubscribe anytime.
          </p>
        </form>
      </HeroBlock>
    </div>
  );
};

export default WaitlistStep;
