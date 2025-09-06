import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../../../services/core';
import { Scenario } from '../../../../../../types';
import ScenarioSelector from '../../../shared/ScenarioSelector/ScenarioSelector';
import { FormSection } from '../../../../../../components/forms/common';

interface ScenarioSectionProps {
  selectedScenarios: string[];
  onScenarioToggle: (scenarioId: string) => void;
}

const ScenarioSection: React.FC<ScenarioSectionProps> = ({ selectedScenarios, onScenarioToggle }) => {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch available scenarios when the component mounts
  useEffect(() => {
    const fetchScenarios = async () => {
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('scenarios')
          .select('*')
          .order('name', { ascending: true });
          
        if (error) {
          console.error('[ScenarioSection] Error fetching scenarios:', error);
          return;
        }
        
        if (data) {
          setScenarios(data as unknown as Scenario[]);
        }
      } catch (error) {
        console.error('[ScenarioSection] Unexpected error fetching scenarios:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchScenarios();
  }, []);
  
  return (
    <FormSection>
      <ScenarioSelector
        scenarios={scenarios}
        selectedScenarios={selectedScenarios}
        onScenarioChange={onScenarioToggle}
        isLoading={isLoading}
        namespace="item-scenario"
      />
    </FormSection>
  );
};

export default ScenarioSection;
