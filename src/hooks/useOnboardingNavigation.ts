import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabaseAuth } from '../context/SupabaseAuthContext';
import { OnboardingStateHook } from './useOnboardingState';
import { updateScenarios } from '../services/api';
import { generateScenariosFromLifestyle } from '../utils/scenarioUtils';
import { Scenario } from '../types';

/**
 * Custom hook to handle onboarding navigation logic
 * Manages step state, navigation between steps, and form submission
 */
export const useOnboardingNavigation = (onboardingState: OnboardingStateHook) => {
  console.log('DEBUG - useOnboardingNavigation hook initialized');
  const { completeOnboarding, user } = useSupabaseAuth();
  const navigate = useNavigate();
  
  // Onboarding steps
  const [step, setStep] = useState(1);
  const totalSteps = 8; // Updated to include scenario frequency step
  const [loading, setLoading] = useState<boolean>(false);

  // Navigation functions
  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo(0, 0);
    }
  };

  // Form submission
  const submitOnboarding = async () => {
    // Set loading state while submitting
    setLoading(true);
    
    // Extract all the state values from the onboarding state hook
    const {
      dailyActivities,
      homeActivities,
      preferredStyles,
      climatePreference,
      leisureActivities,
      hasShoppingLimit,
      shoppingLimitFrequency,
      shoppingLimitAmount,
      clothingBudgetAmount,
      clothingBudgetCurrency,
      clothingBudgetFrequency,
      officeDressCode,
      remoteWorkPriority,
      creativeMobility,
      studentDressCode,
      uniformPreference,
      outdoorFrequency,
      outdoorPeriod,
      socialFrequency,
      socialPeriod,
      formalEventsFrequency,
      formalEventsPeriod,
      travelFrequency,
      comfortVsStyleValue,
      classicVsTrendyValue,
      basicsVsStatementsValue,
      additionalStyleNotes,
      wardrobeGoals,
      otherWardrobeGoalDescription,
      otherLeisureActivityDescription,
      otherActivityDescription,
      scenarios
    } = onboardingState;

    // Debug log for officeDressCode value
    console.log('DEBUG - useOnboardingNavigation - officeDressCode value before API call:', officeDressCode);
    console.log('DEBUG - useOnboardingNavigation - dailyActivities includes office?', dailyActivities.includes('office'));
    console.log('DEBUG - useOnboardingNavigation - dailyActivities includes family?', dailyActivities.includes('family'));
    console.log('DEBUG - useOnboardingNavigation - dailyActivities includes student?', dailyActivities.includes('student'));
    console.log('DEBUG - useOnboardingNavigation - homeActivities value:', homeActivities);
    console.log('DEBUG - useOnboardingNavigation - studentDressCode value:', studentDressCode);
    console.log('DEBUG - useOnboardingNavigation - all state values:', {
      dailyActivities,
      homeActivities,
      officeDressCode,
      remoteWorkPriority,
      creativeMobility
    });
    
    // Ensure officeDressCode is set if 'office' is in dailyActivities
    let finalOfficeDressCode = officeDressCode;
    
    // Log the current value to help debug
    console.log('DEBUG - useOnboardingNavigation - Current officeDressCode value:', officeDressCode);
    
    // Only set default if 'office' is selected but no dress code was explicitly set
    if (dailyActivities.includes('office') && !officeDressCode) {
      console.log('DEBUG - useOnboardingNavigation - Setting default officeDressCode because office is selected but no dress code was set');
      finalOfficeDressCode = 'business-casual';
    } else {
      console.log('DEBUG - useOnboardingNavigation - Using existing officeDressCode value:', finalOfficeDressCode);
    }
    
    // Format the data for the API according to OnboardingData interface
    const onboardingData = {
      // Structure according to the OnboardingData interface
      preferences: {
        favoriteColors: [], // Add empty array as placeholder
        preferredStyles,
        seasonalPreferences: [], // Add empty array as placeholder
        dailyActivities,
        homeActivities,
        leisureActivities,
        otherLeisureActivity: leisureActivities.includes('other') ? otherLeisureActivityDescription : '',
        otherActivityDescription: dailyActivities.includes('other') ? otherActivityDescription : '',
        wardrobeGoals,
        localClimate: climatePreference,
        studentDressCode,
        uniformPreference,
        stylePreferences: {
          comfortVsStyle: comfortVsStyleValue,
          classicVsTrendy: classicVsTrendyValue,
          basicsVsStatements: basicsVsStatementsValue,
          additionalNotes: additionalStyleNotes
        },
        // Include lifestyle fields with proper nested structure
        socialFrequency: {
          frequency: socialFrequency,
          period: socialPeriod
        },
        formalEventsFrequency: {
          frequency: formalEventsFrequency,
          period: formalEventsPeriod
        },
        outdoorFrequency: {
          frequency: outdoorFrequency,
          period: outdoorPeriod
        },
        travelFrequency,
        otherWardrobeGoal: wardrobeGoals.includes('other') ? otherWardrobeGoalDescription : '',
        shoppingLimit: hasShoppingLimit ? {
          hasLimit: hasShoppingLimit,
          limitFrequency: shoppingLimitFrequency,
          limitAmount: shoppingLimitAmount
        } : undefined,
        scenarios
      },
      // Add workStyle as a separate property at the top level
      workStyle: {
        officeDressCode: finalOfficeDressCode,
        remoteWorkPriority,
        creativeMobility
      },
      // Add clothing budget properties as separate properties at the top level
      clothingBudgetAmount,
      clothingBudgetCurrency,
      clothingBudgetFrequency
    };
    
    // Debug logging for clothing budget
    // These logs will appear in the browser console
    console.log('DEBUG - useOnboardingNavigation - Clothing budget values:', {
      amount: clothingBudgetAmount,
      currency: clothingBudgetCurrency,
      frequency: clothingBudgetFrequency
    });
    
    console.log('DEBUG - useOnboardingNavigation - Final onboarding data:', onboardingData);
    
    // Complete onboarding and navigate to dashboard
    const executeOnboardingSubmission = async () => {
      console.log('DEBUG - executeOnboardingSubmission - FUNCTION CALLED - ENTRY POINT');
      console.log('DEBUG - executeOnboardingSubmission - Current step:', step, 'of', totalSteps);
      console.log('DEBUG - executeOnboardingSubmission - Loading state before:', loading);
      
      setLoading(true);
      console.log('DEBUG - executeOnboardingSubmission - Loading state after setLoading(true):', true);
      
      try {
        // Debug log for final onboardingData object
        console.log('DEBUG - executeOnboardingSubmission - final onboardingData:', JSON.stringify(onboardingData, null, 2));
        console.log('DEBUG - executeOnboardingSubmission - final officeDressCode value:', onboardingData.workStyle.officeDressCode);
        // Log the workStyle and preferences objects separately
        console.log('DEBUG - executeOnboardingSubmission - final workStyle object:', onboardingData.workStyle);
        console.log('DEBUG - executeOnboardingSubmission - final preferences object:', onboardingData.preferences);
        
        // Call the API to complete onboarding
        await completeOnboarding(onboardingData);
        console.log('DEBUG - executeOnboardingSubmission - completeOnboarding completed successfully');
      } catch (completeError) {
        console.error('DEBUG - executeOnboardingSubmission - completeOnboarding failed:', completeError);
        throw completeError; // Re-throw to be caught by the outer try/catch
      }
      
      // Save scenarios if they exist
      if (onboardingState.scenarios && onboardingState.scenarios.length > 0) {
        console.log('DEBUG - executeOnboardingSubmission - saving existing scenarios');
        // Get the current user ID from the auth context
        const userId = user?.id;
        
        if (!userId) {
          console.error('DEBUG - executeOnboardingSubmission - user ID not found');
          throw new Error('User ID not found');
        }
        
        const scenarios: Scenario[] = onboardingState.scenarios.map(scenario => ({
          id: scenario.id,
          user_id: userId, // Add the required user_id field
          type: 'custom',  // Add the required type field
          name: scenario.name,
          description: scenario.description,
          frequency: scenario.frequency || 'weekly',
          priority: scenario.priority || 'medium',
          items: scenario.items || [],
          outfits: scenario.outfits || [],
          tags: scenario.tags || [],
          isActive: true
        }));
        
        try {
          console.log('DEBUG - executeOnboardingSubmission - calling updateScenarios with existing scenarios');
          await updateScenarios(scenarios);
          console.log('DEBUG - executeOnboardingSubmission - successfully saved scenarios via updateScenarios');
        } catch (scenarioError) {
          console.error('DEBUG - executeOnboardingSubmission - error saving existing scenarios:', scenarioError);
          // Continue even if scenario saving fails
        }
      } else {
        // Generate default scenarios based on user preferences
        console.log('DEBUG - executeOnboardingSubmission - generating default scenarios');
        try {
          const generatedScenarios = generateScenariosFromLifestyle(
            onboardingState.dailyActivities,
            onboardingState.leisureActivities,
            onboardingState.socialFrequency,
            onboardingState.socialPeriod,
            onboardingState.formalEventsFrequency,
            onboardingState.formalEventsPeriod,
            onboardingState.outdoorFrequency,
            onboardingState.outdoorPeriod,
            onboardingState.travelFrequency,
            onboardingState.remoteWorkPriority
          );
          
          if (generatedScenarios && generatedScenarios.length > 0) {
            console.log('DEBUG - executeOnboardingSubmission - calling updateScenarios with generated scenarios');
            
            // Transform scenarioUtils.Scenario objects to api.Scenario objects
            const apiScenarios = generatedScenarios.map(scenario => ({
              ...scenario,
              user_id: user?.id || '', // Add user_id from useSupabaseAuth hook
              type: 'lifestyle'  // Add a default type
            }));
            
            await updateScenarios(apiScenarios);
            console.log('DEBUG - executeOnboardingSubmission - successfully saved generated scenarios');
          } else {
            console.log('DEBUG - executeOnboardingSubmission - no scenarios were generated');
          }
        } catch (scenarioError) {
          console.error('DEBUG - executeOnboardingSubmission - error generating/saving default scenarios:', scenarioError);
          // Continue even if scenario generation fails
        }
      }
      
      // Capture the current token before navigation
      const currentToken = localStorage.getItem('token');
      console.log('DEBUG - executeOnboardingSubmission - captured current token before navigation:', currentToken ? 'token exists' : 'no token');
      
      // Navigate to the home page
      console.log('DEBUG - executeOnboardingSubmission - about to call navigate("/")');
      navigate('/');
      console.log('DEBUG - executeOnboardingSubmission - navigation called, checking if we reach code after navigate');
      
      // Then ensure authentication state is preserved after navigation
      console.log('DEBUG - executeOnboardingSubmission - setting up setTimeout');
      // Store a reference to the timeout so we can clear it if needed
      const timeoutId = setTimeout(() => {
        console.log('DEBUG - executeOnboardingSubmission - setTimeout callback started');
        
        // Check if document still exists (page hasn't been unloaded)
        if (typeof document === 'undefined') {
          console.log('DEBUG - executeOnboardingSubmission - document no longer exists, aborting');
          return;
        }
        
        // Double-check token is still in localStorage
        if (!localStorage.getItem('token') && currentToken) {
          console.log('DEBUG - executeOnboardingSubmission - token missing after navigation, restoring it');
          localStorage.setItem('token', currentToken);
        } else {
          console.log('DEBUG - executeOnboardingSubmission - token still exists in localStorage');
        }
        
        // Verify user data is still in localStorage with onboardingCompleted=true
        try {
          const userAfterNav = JSON.parse(localStorage.getItem('user') || '{}');
          console.log('DEBUG - executeOnboardingSubmission - user data after navigation:', userAfterNav);
          if (!userAfterNav.onboardingCompleted) {
            console.log('DEBUG - executeOnboardingSubmission - onboardingCompleted flag missing, restoring it');
            userAfterNav.onboardingCompleted = true;
            localStorage.setItem('user', JSON.stringify(userAfterNav));
          } else {
            console.log('DEBUG - executeOnboardingSubmission - onboardingCompleted flag already set');
          }
        } catch (e) {
          console.error('DEBUG - executeOnboardingSubmission - error checking user data after navigation:', e);
        }
        
        // Force a reload only as a last resort if needed
        if (!localStorage.getItem('token') || !localStorage.getItem('user')) {
          console.log('DEBUG - executeOnboardingSubmission - critical auth state missing, about to force page reload');
          // Comment out the forced reload for debugging
          // window.location.href = '/';
          console.log('DEBUG - executeOnboardingSubmission - forced reload temporarily disabled for debugging');
        } else {
          console.log('DEBUG - executeOnboardingSubmission - auth state intact, no reload needed');
        }
        console.log('DEBUG - executeOnboardingSubmission - setTimeout callback completed');
      }, 500);
      
      // Return a cleanup function that will cancel the timeout if the component unmounts
      return () => {
        clearTimeout(timeoutId);
      };
    };
    
    try {
      await executeOnboardingSubmission();
    } catch (error) {
      console.error('DEBUG - executeOnboardingSubmission - error in main try/catch:', error);
    } finally {
      console.log('DEBUG - executeOnboardingSubmission - finally block reached');
      setLoading(false);
      console.log('DEBUG - executeOnboardingSubmission - loading set to false');
    }
  };
  


  return {
    step,
    totalSteps,
    loading,
    nextStep,
    prevStep,
    submitOnboarding
  };
};

export type OnboardingNavigationHook = ReturnType<typeof useOnboardingNavigation>;
