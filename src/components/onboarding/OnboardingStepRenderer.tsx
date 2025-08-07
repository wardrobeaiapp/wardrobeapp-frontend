import React from 'react';
import { OnboardingStateHook } from '../../hooks/useOnboardingState';
import { OnboardingEventAdapters } from '../../hooks/useOnboardingEventAdapters';

// Import step components
import {
  DailyActivitiesStep,
  LeisureActivitiesStep,
  StylePreferencesStep,
  ClimatePreferenceStep,
  WardrobeGoalsStep,
  ShoppingLimitStep,
  ClothingBudgetStep,
  ScenarioStep
} from './';

interface OnboardingStepRendererProps {
  step: number;
  onboardingState: OnboardingStateHook;
  eventAdapters: OnboardingEventAdapters;
}

/**
 * Component to render the appropriate onboarding step based on current step number
 */
const OnboardingStepRenderer: React.FC<OnboardingStepRendererProps> = ({
  step,
  onboardingState,
  eventAdapters
}) => {
  const {
    dailyActivities,
    officeDressCode,
    remoteWorkPriority,
    creativeMobility,
    uniformPreference,
    studentDressCode,
    homeActivities,
    otherActivityDescription,
    leisureActivities,
    otherLeisureActivityDescription,
    outdoorFrequency,
    outdoorPeriod,
    socialFrequency,
    socialPeriod,
    formalEventsFrequency,
    formalEventsPeriod,
    travelFrequency,
    preferredStyles,
    comfortVsStyleValue,
    classicVsTrendyValue,
    basicsVsStatementsValue,
    additionalStyleNotes,
    climatePreference,
    wardrobeGoals,
    otherWardrobeGoalDescription,
    shoppingLimitAmount,
    shoppingLimitFrequency,
    clothingBudgetAmount,
    clothingBudgetCurrency,
    clothingBudgetFrequency
  } = onboardingState;

  const {
    handleActivityToggle,
    handleDressCodeSelect,
    handleRemoteWorkPrioritySelect,
    handleCreativeMobilitySelect,
    handleUniformPreferenceSelect,
    handleStudentDressCodeSelect,
    handleOtherActivityDescriptionChange,
    handleOutdoorFrequencyChange,
    handleOutdoorPeriodChange,
    handleSocialFrequencyChange,
    handleSocialPeriodChange,
    handleFormalEventsFrequencyChange,
    handleFormalEventsPeriodChange,
    handleTravelFrequencyChange,
    handleOtherLeisureActivityDescriptionChange,
    handleComfortVsStyleChange,
    handleClassicVsTrendyChange,
    handleBasicsVsStatementsChange,
    handleShoppingLimitAmountInput,
    handleClothingBudgetAmountInput
  } = eventAdapters;

  // Render the appropriate step based on current step number
  switch (step) {
    case 1:
      return (
        <DailyActivitiesStep
          dailyActivities={dailyActivities}
          officeDressCode={officeDressCode}
          remoteWorkPriority={remoteWorkPriority}
          creativeMobility={creativeMobility}
          uniformPreference={uniformPreference}
          studentDressCode={studentDressCode}
          homeActivities={homeActivities}
          otherActivityDescription={otherActivityDescription}
          handleActivityToggle={handleActivityToggle}
          handleDressCodeSelect={handleDressCodeSelect}
          handleRemoteWorkPrioritySelect={handleRemoteWorkPrioritySelect}
          handleCreativeMobilitySelect={handleCreativeMobilitySelect}
          handleUniformPreferenceSelect={handleUniformPreferenceSelect}
          handleStudentDressCodeSelect={handleStudentDressCodeSelect}
          handleHomeActivityToggle={onboardingState.handleHomeActivityToggle}
          handleOtherActivityChange={handleOtherActivityDescriptionChange}
        />
      );
    case 2:
      return (
        <LeisureActivitiesStep
          leisureActivities={leisureActivities}
          otherLeisureActivityDescription={otherLeisureActivityDescription}
          outdoorFrequency={outdoorFrequency}
          outdoorPeriod={outdoorPeriod}
          socialFrequency={socialFrequency}
          socialPeriod={socialPeriod}
          formalEventsFrequency={formalEventsFrequency}
          formalEventsPeriod={formalEventsPeriod}
          travelFrequency={travelFrequency}
          handleLeisureActivityToggle={onboardingState.handleLeisureActivityToggle}
          handleOtherLeisureActivityDescriptionChange={handleOtherLeisureActivityDescriptionChange}
          handleOutdoorFrequencyChange={handleOutdoorFrequencyChange}
          handleOutdoorPeriodChange={handleOutdoorPeriodChange}
          handleSocialFrequencyChange={handleSocialFrequencyChange}
          handleSocialPeriodChange={handleSocialPeriodChange}
          handleFormalEventsFrequencyChange={handleFormalEventsFrequencyChange}
          handleFormalEventsPeriodChange={handleFormalEventsPeriodChange}
          handleTravelFrequencyChange={handleTravelFrequencyChange}
        />
      );
    case 3:
      return (
        <StylePreferencesStep
          preferredStyles={preferredStyles}
          comfortVsStyleValue={comfortVsStyleValue}
          classicVsTrendyValue={classicVsTrendyValue}
          basicsVsStatementsValue={basicsVsStatementsValue}
          additionalStyleNotes={additionalStyleNotes}
          handleStyleToggle={onboardingState.handleStyleToggle}
          handleComfortVsStyleChange={handleComfortVsStyleChange}
          handleClassicVsTrendyChange={handleClassicVsTrendyChange}
          handleBasicsVsStatementsChange={handleBasicsVsStatementsChange}
          handleAdditionalStyleNotesChange={(e) => onboardingState.setAdditionalStyleNotes(e.target.value)}
        />
      );
    case 4:
      return (
        <ClimatePreferenceStep
          climatePreference={climatePreference}
          handleClimatePreferenceSelect={onboardingState.handleClimateSelection}
        />
      );
    case 5:
      return (
        <WardrobeGoalsStep
          wardrobeGoals={wardrobeGoals}
          otherWardrobeGoalDescription={otherWardrobeGoalDescription}
          handleWardrobeGoalToggle={onboardingState.handleWardrobeGoalToggle}
          handleOtherWardrobeGoalChange={(e) => onboardingState.handleOtherWardrobeGoalDescriptionChange(e.target.value)}
        />
      );
    case 6:
      return (
        <ShoppingLimitStep
          amount={shoppingLimitAmount}
          frequency={shoppingLimitFrequency}
          onAmountChange={(amount) => {
            const event = { target: { value: amount.toString() } } as React.ChangeEvent<HTMLInputElement>;
            handleShoppingLimitAmountInput(event);
          }}
          onFrequencyChange={onboardingState.handleShoppingLimitFrequencyChange}
        />
      );
    case 7:
      return (
        <ClothingBudgetStep
          amount={clothingBudgetAmount}
          currency={clothingBudgetCurrency}
          frequency={clothingBudgetFrequency}
          onAmountChange={(amount) => {
            const event = { target: { value: amount.toString() } } as React.ChangeEvent<HTMLInputElement>;
            handleClothingBudgetAmountInput(event);
          }}
          onCurrencyChange={onboardingState.handleClothingBudgetCurrencyChange}
          onFrequencyChange={onboardingState.handleClothingBudgetFrequencyChange}
        />
      );
    case 8:
      return (
        <ScenarioStep 
          dailyActivities={dailyActivities}
          leisureActivities={leisureActivities}
          socialFrequency={socialFrequency}
          socialPeriod={socialPeriod}
          formalEventsFrequency={formalEventsFrequency}
          formalEventsPeriod={formalEventsPeriod}
          outdoorFrequency={outdoorFrequency}
          outdoorPeriod={outdoorPeriod}
          travelFrequency={travelFrequency}
          remoteWorkPriority={remoteWorkPriority.toString()}
          otherActivityDescription={otherActivityDescription}
          otherLeisureActivityDescription={otherLeisureActivityDescription}
          scenarios={onboardingState.scenarios}
          handleScenariosChange={onboardingState.handleScenariosChange}
        />
      );
    default:
      return null;
  }
};

export default OnboardingStepRenderer;
