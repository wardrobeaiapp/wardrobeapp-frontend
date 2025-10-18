import { useState, useEffect } from 'react';
import { supabase } from '../../../../../../services/core';
import { useSupabaseAuth } from '../../../../../../context/SupabaseAuthContext';
import { Scenario } from '../../../../../../types';

/**
 * Custom hook for fetching and managing scenarios for the current user
 * @returns Object containing scenarios, loading state, and error state
 */
export const useScenarios = () => {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useSupabaseAuth();

  useEffect(() => {
    const fetchScenarios = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // 🔒 SECURITY CHECK: Only fetch scenarios for the authenticated user
        if (!isAuthenticated || !user?.id) {
          console.warn('[useScenarios] No authenticated user - cannot fetch scenarios');
          setScenarios([]);
          return;
        }
        
        const { data, error: fetchError } = await supabase
          .from('scenarios')
          .select('*')
          .eq('user_id', user.id) // 🚨 CRITICAL: Filter by user_id to prevent data leakage
          .order('name', { ascending: true });
          
        if (fetchError) {
          console.error('[useScenarios] Error fetching scenarios:', fetchError);
          setError('Failed to load scenarios');
          setScenarios([]);
          return;
        }
        
        if (data) {
          console.log(`[useScenarios] Successfully fetched ${data.length} scenarios for user ${user.id}`);
          setScenarios(data as unknown as Scenario[]);
        }
      } catch (err) {
        console.error('[useScenarios] Unexpected error fetching scenarios:', err);
        setError('Unexpected error loading scenarios');
        setScenarios([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchScenarios();
  }, [isAuthenticated, user?.id]); // Re-fetch when auth state changes

  return {
    scenarios,
    isLoading,
    error
  };
};
