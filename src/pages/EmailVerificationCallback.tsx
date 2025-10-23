import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSupabaseAuth } from '../context/SupabaseAuthContext';
import { supabase } from '../services/core/supabase';
import styled from 'styled-components';

// Styled components
const CallbackContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f9fafb;
  padding: 20px;
`;

const CallbackCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 400px;
  width: 100%;
`;

const LoadingSpinner = styled.div`
  border: 3px solid #f3f4f6;
  border-top: 3px solid #4f46e5;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #111827;
`;

const Message = styled.p`
  font-size: 16px;
  color: #6b7280;
  margin-bottom: 20px;
  line-height: 1.5;
`;

const ErrorMessage = styled.div`
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
`;

const SuccessMessage = styled.div`
  background-color: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #16a34a;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
`;

type VerificationState = 'verifying' | 'success' | 'error' | 'redirecting';

const EmailVerificationCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, refreshUserData } = useSupabaseAuth();
  
  const [state, setState] = useState<VerificationState>('verifying');
  const [message, setMessage] = useState('Verifying your email...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const handleEmailVerification = async () => {
      try {
        console.log('🔐 EmailVerificationCallback: Starting verification process');
        console.log('🔐 Current URL:', window.location.href);
        console.log('🔐 URL Hash:', window.location.hash);
        console.log('🔐 URL Search:', window.location.search);
        
        // Set up auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log('🔐 Auth state changed:', event, session ? 'Session exists' : 'No session');
          
          if (event === 'SIGNED_IN' && session) {
            console.log('🔐 User signed in via email verification!');
            // Clean up the subscription
            subscription.unsubscribe();
            // Proceed with the success flow
            await handleVerificationSuccess(session);
            return;
          }
          
          if (event === 'TOKEN_REFRESHED' && session) {
            console.log('🔐 Token refreshed after verification');
            // Clean up the subscription
            subscription.unsubscribe();
            // Proceed with the success flow
            await handleVerificationSuccess(session);
            return;
          }
        });
        
        // Also check if there's already a session (in case verification happened before we set up the listener)
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        console.log('🔐 Initial session check:', {
          hasSession: !!sessionData.session,
          sessionError: sessionError?.message,
          userId: sessionData.session?.user?.id
        });

        if (sessionData.session) {
          // Clean up the subscription since we already have a session
          subscription.unsubscribe();
          await handleVerificationSuccess(sessionData.session);
          return;
        }
        
        // Set a timeout to show error if verification doesn't happen within 10 seconds
        timeoutId = setTimeout(() => {
          subscription.unsubscribe();
          setState('error');
          setError('Email verification timed out. The link may be invalid or expired. Please try registering again.');
        }, 10000);

      } catch (verificationError: any) {
        console.error('🔐 Email verification error:', verificationError);
        setState('error');
        setError(verificationError.message || 'Email verification failed');
      }
    };
    
    const handleVerificationSuccess = async (session: any) => {
      try {
        // Clear the timeout
        if (timeoutId) clearTimeout(timeoutId);

        // Refresh user data to get the latest profile information
        console.log('🔐 Refreshing user data...');
        await refreshUserData();
        
        setState('success');
        setMessage('Email verified successfully! Setting up your account...');

        // Wait a moment for the user state to update
        setTimeout(async () => {
          try {
            console.log('🔐 Current user after verification:', {
              id: session.user.id,
              email: session.user.email,
              emailConfirmed: session.user.email_confirmed_at,
              metadata: session.user.user_metadata
            });

            // Check if user has completed onboarding
            const onboardingCompleted = session.user.user_metadata?.onboardingCompleted || false;
            
            console.log('🔐 Onboarding status check:', {
              fromMetadata: onboardingCompleted,
              fromContext: user?.onboardingCompleted
            });

            setState('redirecting');

            if (onboardingCompleted) {
              setMessage('Welcome back! Redirecting to your wardrobe...');
              console.log('🔐 User has completed onboarding, redirecting to home');
              setTimeout(() => navigate('/', { replace: true }), 1500);
            } else {
              setMessage('Welcome to WardrobeAI! Let\'s set up your profile...');
              console.log('🔐 New user, redirecting to onboarding');
              setTimeout(() => navigate('/onboarding', { replace: true }), 1500);
            }
          } catch (redirectError: any) {
            console.error('Redirect error:', redirectError);
            setError(redirectError.message || 'Failed to redirect after verification');
            setState('error');
          }
        }, 2000);

      } catch (successError: any) {
        console.error('🔐 Verification success handling error:', successError);
        setState('error');
        setError(successError.message || 'Failed to complete verification');
      }
    };

    handleEmailVerification();
    
    // Cleanup function
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [navigate, searchParams, user, refreshUserData]);

  const renderContent = () => {
    switch (state) {
      case 'verifying':
        return (
          <>
            <LoadingSpinner />
            <Title>Verifying Email</Title>
            <Message>{message}</Message>
          </>
        );

      case 'success':
        return (
          <>
            <SuccessMessage>
              ✅ Email verification successful!
            </SuccessMessage>
            <Title>Verification Complete</Title>
            <Message>{message}</Message>
          </>
        );

      case 'redirecting':
        return (
          <>
            <LoadingSpinner />
            <Title>Almost Ready!</Title>
            <Message>{message}</Message>
          </>
        );

      case 'error':
        return (
          <>
            <Title>Verification Failed</Title>
            <ErrorMessage>{error}</ErrorMessage>
            <Message>
              Please try clicking the verification link in your email again. 
              If the problem persists, you can{' '}
              <a 
                href="/register" 
                style={{ color: '#4f46e5', textDecoration: 'underline' }}
              >
                create a new account
              </a>
              {' '}or{' '}
              <a 
                href="/login" 
                style={{ color: '#4f46e5', textDecoration: 'underline' }}
              >
                try logging in
              </a>
              .
            </Message>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <CallbackContainer>
      <CallbackCard>
        {renderContent()}
      </CallbackCard>
    </CallbackContainer>
  );
};

export default EmailVerificationCallback;
