import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../../../services/core';
import { Scenario } from '../../../../../../types';
import ScenarioSelector from '../../../shared/ScenarioSelector/ScenarioSelector';
import { FormSection } from '../../../../../../components/forms/common';
import { useSupabaseAuth } from '../../../../../../context/SupabaseAuthContext';

interface ScenarioSectionProps {
  selectedScenarios: string[];
  onScenarioToggle: (scenarioId: string) => void;
}

const ScenarioSection: React.FC<ScenarioSectionProps> = ({ selectedScenarios, onScenarioToggle }) => {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAuthenticated } = useSupabaseAuth();
  
  // Fetch available scenarios when the component mounts
  useEffect(() => {
    const fetchScenarios = async () => {
      try {
        setIsLoading(true);
        
        // 🔒 SECURITY FIX: Only fetch scenarios for the authenticated user
        if (!isAuthenticated || !user?.id) {
          console.warn('[ScenarioSection] No authenticated user - cannot fetch scenarios');
          setScenarios([]);
          return;
        }
        
        const { data, error } = await supabase
          .from('scenarios')
          .select('*')
          .eq('user_id', user.id) // 🚨 CRITICAL FIX: Filter by user_id to prevent data leakage
          .order('name', { ascending: true });
          
        if (error) {
          console.error('[ScenarioSection] Error fetching scenarios:', error);
          setScenarios([]);
          return;
        }
        
        if (data) {
          console.log(`[ScenarioSection] Successfully fetched ${data.length} scenarios for user ${user.id}`);
          setScenarios(data as unknown as Scenario[]);
        }
      } catch (error) {
        console.error('[ScenarioSection] Unexpected error fetching scenarios:', error);
        setScenarios([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchScenarios();
  }, [isAuthenticated, user?.id]); // Re-fetch when auth state changes
  
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
