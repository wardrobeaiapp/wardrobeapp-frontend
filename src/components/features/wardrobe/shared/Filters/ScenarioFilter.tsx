import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { supabase } from '../../../../../services/core';
import { FormField, FormSelect } from '../../../../common/Form';
import { useSupabaseAuth } from '../../../../../context/SupabaseAuthContext';

const StyledSelect = styled(FormSelect)`
  min-width: 160px;
`;

interface ScenarioFilterProps {
  value: string;
  onChange: (value: string) => void;
  includeAllOption?: boolean;
  allowUnauthenticated?: boolean; // For demo mode - allows fetching scenarios without authentication
}

const ScenarioFilter: React.FC<ScenarioFilterProps> = ({ 
  value, 
  onChange, 
  includeAllOption = false,
  allowUnauthenticated = false 
}) => {
  const [scenarios, setScenarios] = useState<Array<{ id: string; name: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAuthenticated } = useSupabaseAuth();

  useEffect(() => {
    const fetchScenarios = async () => {
      try {
        setIsLoading(true);
        
        // 🔒 SECURITY CHECK: Authentication required unless in demo mode
        if (!allowUnauthenticated && (!isAuthenticated || !user?.id)) {
          console.warn('[ScenarioFilter] No authenticated user - cannot fetch scenarios');
          setScenarios([]);
          return;
        }
        
        let query = supabase
          .from('scenarios')
          .select('id, name');
        
        // 🔒 SECURITY FIX: Filter by user_id to prevent data leakage (except in demo mode)
        if (!allowUnauthenticated && user?.id) {
          query = query.eq('user_id', user.id);
          console.log(`[ScenarioFilter] Fetching scenarios for authenticated user ${user.id}`);
        } else if (allowUnauthenticated) {
          console.log('[ScenarioFilter] Demo mode: Fetching all scenarios (public access via RLS)');
        }
        
        const { data, error } = await query.order('name', { ascending: true });
          
        if (error) {
          console.error('[ScenarioFilter] Error fetching scenarios:', error);
          setScenarios([]);
          return;
        }
        
        if (data) {
          const logContext = allowUnauthenticated 
            ? 'demo mode' 
            : `user ${user?.id || 'unknown'}`;
          console.log(`[ScenarioFilter] Successfully fetched ${data.length} scenarios for ${logContext}`);
          setScenarios(data as Array<{ id: string; name: string }>);
        }
      } catch (error) {
        console.error('[ScenarioFilter] Unexpected error:', error);
        setScenarios([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchScenarios();
  }, [isAuthenticated, user?.id, allowUnauthenticated]); // Re-fetch when auth state or demo mode changes

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
