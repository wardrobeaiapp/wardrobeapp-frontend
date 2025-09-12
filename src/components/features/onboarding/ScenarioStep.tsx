import React, { useEffect } from 'react';
import { generateScenariosFromLifestyle, Scenario } from '../../../utils/scenarioUtils';
import ScenarioFrequencyStep from './ScenarioFrequencyStep';

interface ScenarioStepProps {
  dailyActivities: string[];
  leisureActivities: string[];
  socialFrequency: number;
  socialPeriod: string;
  formalEventsFrequency: number;
  formalEventsPeriod: string;
  outdoorFrequency: number;
  outdoorPeriod: string;
  travelFrequency: string;
  remoteWorkPriority: string;
  otherActivityDescription: string;
  otherLeisureActivityDescription: string;
  officeDressCode: string;
  creativeMobility: string;
  studentDressCode: string;
  uniformPreference: string;
  scenarios: Scenario[];
  handleScenariosChange: (scenarios: Scenario[]) => void;
}

const ScenarioStep: React.FC<ScenarioStepProps> = ({
  dailyActivities,
  leisureActivities,
  socialFrequency,
  socialPeriod,
  formalEventsFrequency,
  formalEventsPeriod,
  outdoorFrequency,
  outdoorPeriod,
  travelFrequency,
  remoteWorkPriority,
  otherActivityDescription,
  otherLeisureActivityDescription,
  officeDressCode,
  creativeMobility,
  studentDressCode,
  uniformPreference,
  scenarios,
  handleScenariosChange
}) => {
  // Generate scenarios based on the user's lifestyle choices
  const generatedScenarios = generateScenariosFromLifestyle(
    dailyActivities,
    leisureActivities,
    socialFrequency,
    socialPeriod,
    formalEventsFrequency,
    formalEventsPeriod,
    outdoorFrequency,
    outdoorPeriod,
    travelFrequency,
    remoteWorkPriority, // Pass the remote work priority to handle Remote Work vs Staying at Home relationship
    otherActivityDescription,
    otherLeisureActivityDescription,
    officeDressCode,
    creativeMobility,
    studentDressCode,
    uniformPreference
  );
  
  // Use useEffect to update state outside of render
  useEffect(() => {
    // If scenarios are empty, set them in the state to ensure they're included in onboarding data
    if (scenarios.length === 0 && generatedScenarios.length > 0) {
      console.log('Setting generated scenarios in onboarding state:', generatedScenarios);
      handleScenariosChange(generatedScenarios);
    }
  }, [scenarios.length, generatedScenarios, handleScenariosChange]);
  
  // Always use scenarios from state if available, otherwise use generated ones
  const scenariosToUse = scenarios.length > 0 ? scenarios : generatedScenarios;
  
  return (
    <ScenarioFrequencyStep
      scenarios={scenariosToUse}
      onScenariosChange={handleScenariosChange}
      onNext={() => {}}
      onBack={() => {}}
    />
  );
};

export default ScenarioStep;
