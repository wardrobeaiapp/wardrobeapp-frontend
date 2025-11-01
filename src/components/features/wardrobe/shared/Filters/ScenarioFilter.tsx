import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { supabase } from '../../../../../services/core';
import { FormField, FormSelect } from '../../../../common/Form';
import { useSupabaseAuth } from '../../../../../context/SupabaseAuthContext';
import { getDemoScenarios, isDemoUser } from '../../../../../services/scenarios/demoScenarioService';
import { WardrobeItem } from '../../../../../types';

const StyledSelect = styled(FormSelect)`
  min-width: 160px;
`;

interface ScenarioFilterProps {
  value: string;
  onChange: (value: string) => void;
  includeAllOption?: boolean;
  allowUnauthenticated?: boolean; // For demo mode - allows fetching scenarios without authentication
  items?: WardrobeItem[]; // Optional: items being filtered (to auto-detect demo user)
}

const ScenarioFilter: React.FC<ScenarioFilterProps> = ({ 
  value, 
  onChange, 
  includeAllOption = false,
  allowUnauthenticated = false,
  items
}) => {
  const [scenarios, setScenarios] = useState<Array<{ id: string; name: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAuthenticated } = useSupabaseAuth();

  useEffect(() => {
    const fetchScenarios = async () => {
      try {
        setIsLoading(true);
        
        // 🎭 DEMO MODE: Auto-detect demo user from items and use dedicated demo service
        if (allowUnauthenticated && items && items.length > 0) {
          const detectedUserId = items[0]?.userId;
          if (detectedUserId && isDemoUser(detectedUserId)) {
            console.log(`[ScenarioFilter] Demo mode: Auto-detected demo user ${detectedUserId}, using demo service`);
            const demoScenarios = await getDemoScenarios(detectedUserId);
            setScenarios(demoScenarios);
            return;
          }
        }
        
        // 🔒 SECURITY CHECK: Authentication required for regular users
        if (!allowUnauthenticated && (!isAuthenticated || !user?.id)) {
          console.warn('[ScenarioFilter] No authenticated user - cannot fetch scenarios');
          setScenarios([]);
          return;
        }
        
        // 🔒 REGULAR MODE: Use authenticated user's scenarios
        if (!allowUnauthenticated && user?.id) {
          console.log(`[ScenarioFilter] Fetching scenarios for authenticated user ${user.id}`);
          const { data, error } = await supabase
            .from('scenarios')
            .select('id, name')
            .eq('user_id', user.id)
            .order('name', { ascending: true });
            
          if (error) {
            console.error('[ScenarioFilter] Error fetching scenarios:', error);
            setScenarios([]);
            return;
          }
          
          console.log(`[ScenarioFilter] Successfully fetched ${data?.length || 0} scenarios for user ${user.id}`);
          setScenarios((data || []) as Array<{ id: string; name: string }>);
          return;
        }
        
        // ⚠️ Fallback: This shouldn't happen but just in case
        console.warn('[ScenarioFilter] Unexpected state - no valid user context');
        setScenarios([]);
        
      } catch (error) {
        console.error('[ScenarioFilter] Unexpected error:', error);
        setScenarios([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchScenarios();
  }, [isAuthenticated, user?.id, allowUnauthenticated, items]); // Re-fetch when auth state, demo mode, or items change

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  return (
    <FormField label="Scenario" htmlFor="scenario-filter">
      <StyledSelect
        id="scenario-filter"
        value={value}
        onChange={handleChange}
        disabled={isLoading}
      >
        {includeAllOption && <option value="all">All Scenarios</option>}
        {scenarios.map((scenario) => (
          <option key={scenario.id} value={scenario.id}>
            {scenario.name}
          </option>
        ))}
      </StyledSelect>
    </FormField>
  );
};

export default ScenarioFilter;
