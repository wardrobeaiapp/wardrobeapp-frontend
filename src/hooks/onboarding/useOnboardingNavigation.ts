import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabaseAuth } from '../../context/SupabaseAuthContext';
import { OnboardingStateHook } from './useOnboardingState';
import { createScenario, getScenariosForUser } from '../../services/scenarios';
import { generateScenariosFromLifestyle } from '../../utils/scenarioUtils';

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
    
    // Extract state values for user_preferences and scenario generation
    const {
      dailyActivities,
      preferredStyles,
      climatePreference,
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
      comfortVsStyleValue,
      classicVsTrendyValue,
      basicsVsStatementsValue,
      additionalStyleNotes,
      wardrobeGoals,
      otherWardrobeGoalDescription,
      scenarios
    } = onboardingState;

    // Debug log for officeDressCode value
    console.log('DEBUG - useOnboardingNavigation - officeDressCode value before API call:', officeDressCode);
    console.log('DEBUG - useOnboardingNavigation - dailyActivities includes office?', dailyActivities.includes('office'));
    console.log('DEBUG - useOnboardingNavigation - dailyActivities includes family?', dailyActivities.includes('family'));
    console.log('DEBUG - useOnboardingNavigation - dailyActivities includes student?', dailyActivities.includes('student'));
    console.log('DEBUG - useOnboardingNavigation - studentDressCode value:', studentDressCode);
    console.log('DEBUG - useOnboardingNavigation - all state values:', {
      dailyActivities,
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
    // Note: dailyActivities, leisureActivities, and follow-up contexts are no longer saved
    // to user_preferences to avoid data inconsistency - scenarios are the single source of truth
    const onboardingData = {
      // Structure according to the OnboardingData interface
      preferences: {
        preferredStyles,
        wardrobeGoals,
        localClimate: climatePreference,
        stylePreferences: {
          comfortVsStyle: comfortVsStyleValue,
          classicVsTrendy: classicVsTrendyValue,
          basicsVsStatements: basicsVsStatementsValue,
          additionalNotes: additionalStyleNotes
        },
        otherWardrobeGoal: wardrobeGoals.includes('other') ? otherWardrobeGoalDescription : '',
        shoppingLimit: hasShoppingLimit ? {
          hasLimit: hasShoppingLimit,
          limitFrequency: shoppingLimitFrequency,
          limitAmount: shoppingLimitAmount
        } : undefined,
        scenarios
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
        console.log('DEBUG - executeOnboardingSubmission - final preferences object:', onboardingData.preferences);
        console.log('DEBUG - executeOnboardingSubmission - style preferences values:', {
          preferredStyles,
          climatePreference, 
          wardrobeGoals,
          comfortVsStyleValue,
          classicVsTrendyValue,
          basicsVsStatementsValue,
          additionalStyleNotes
        });
        
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
        
        // Scenarios are saved separately in the scenario generation logic below
        
        try {
          console.log('DEBUG - executeOnboardingSubmission - saving existing scenarios');
          // First, get existing scenarios to avoid duplicates
          const existingScenarios = await getScenariosForUser(user.id);
          const existingScenarioNames = new Set(existingScenarios.map(s => s.name));
          
          // Only save scenarios that don't already exist
          const newScenarios = scenarios.filter(s => !existingScenarioNames.has(s.name));
          
          if (newScenarios.length > 0) {
            console.log(`DEBUG - Saving ${newScenarios.length} new scenarios`);
            for (const scenario of newScenarios) {
              await createScenario({
                ...scenario,
                user_id: user.id
              });
            }
            console.log('DEBUG - Successfully saved new scenarios');
          } else {
            console.log('DEBUG - No new scenarios to save');
          }
        } catch (scenarioError) {
          console.error('DEBUG - executeOnboardingSubmission - error saving existing scenarios:', scenarioError);
          // Continue even if scenario saving fails
        }
      } else {
        // Generate default scenarios based on user preferences
        console.log('DEBUG - executeOnboardingSubmission - generating default scenarios');
        try {
          if (!user) {
            throw new Error('User not authenticated');
          }
          
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
            onboardingState.remoteWorkPriority,
            onboardingState.otherActivityDescription,
            onboardingState.otherLeisureActivityDescription,
            onboardingState.officeDressCode,
            onboardingState.creativeMobility,
            onboardingState.studentDressCode,
            onboardingState.uniformPreference
          );
          
          if (generatedScenarios && generatedScenarios.length > 0) {
            console.log('DEBUG - executeOnboardingSubmission - saving generated scenarios');
            
            // First, get existing scenarios to avoid duplicates
            const existingScenarios = await getScenariosForUser(user.id);
            const existingScenarioNames = new Set(existingScenarios.map(s => s.name));
            
            // Transform and filter scenarios
            const newScenarios = generatedScenarios
              .filter(scenario => !existingScenarioNames.has(scenario.name))
              .map(scenario => ({
                ...scenario,
                user_id: user.id
              }));
            
            if (newScenarios.length > 0) {
              console.log(`DEBUG - Saving ${newScenarios.length} new generated scenarios`);
              console.log('DEBUG - Scenarios to save:', newScenarios);
              for (const scenario of newScenarios) {
                try {
                  console.log('DEBUG - Saving scenario:', scenario.name, 'with description:', scenario.description);
                  const savedScenario = await createScenario(scenario);
                  console.log('DEBUG - Successfully saved scenario:', savedScenario);
                } catch (scenarioError) {
                  console.error('DEBUG - Error saving scenario:', scenario.name, scenarioError);
                }
              }
              console.log('DEBUG - Finished saving all scenarios');
            } else {
              console.log('DEBUG - No new generated scenarios to save');
            }
          }
        } catch (error) {
          console.error('Error generating or saving scenarios:', error);
          // Continue with onboarding even if scenario generation fails
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
