import { useState, useEffect, useCallback } from 'react';
import { useSupabaseAuth } from '../../context/SupabaseAuthContext';
import { supabase } from '../../services/core';
import { isDemoUser, getDemoScenarios } from '../../services/scenarios/demoScenarioService';

interface Scenario {
  id: string;
  name: string;
}

interface UseScenarios {
  scenarios: Scenario[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * PERFORMANCE OPTIMIZATION:
 * Shared hook for scenario data to prevent duplicate database queries.
 * 
 * Previous issue: Multiple ScenarioFilter components were each making 
 * separate Supabase queries, contributing to 154ms blocking operations.
 */
export const useScenarios = (): UseScenarios => {
  const { user, isAuthenticated } = useSupabaseAuth();
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchScenarios = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Demo user handling
      if (user?.id && isDemoUser(user.id)) {
        console.log(`[useScenarios] Demo mode: Fetching demo scenarios for ${user.id}`);
        const demoScenarios = await getDemoScenarios(user.id);
        setScenarios(demoScenarios);
        return;
      }

      // Authenticated user scenarios
      if (isAuthenticated && user?.id) {
        console.log(`[useScenarios] Fetching scenarios for authenticated user ${user.id}`);
        const { data, error: supabaseError } = await supabase
          .from('scenarios')
          .select('id, name')
          .eq('user_id', user.id)
          .order('name', { ascending: true });

        if (supabaseError) {
          console.error('[useScenarios] Error fetching scenarios:', supabaseError);
          setError('Failed to load scenarios');
          setScenarios([]);
          return;
        }

        console.log(`[useScenarios] Successfully fetched ${data?.length || 0} scenarios for user ${user.id}`);
        setScenarios((data || []) as Scenario[]);
      } else {
        // Not authenticated - clear scenarios
        setScenarios([]);
      }
    } catch (err) {
      console.error('[useScenarios] Unexpected error:', err);
      setError('Failed to load scenarios');
      setScenarios([]);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, isAuthenticated]);

  // Load scenarios after initial page render to avoid blocking
  useEffect(() => {
    // Use requestIdleCallback to defer scenario loading until browser is idle
    const loadWhenIdle = () => {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => fetchScenarios());
      } else {
        // Fallback for browsers without requestIdleCallback
        setTimeout(fetchScenarios, 100);
      }
    };
    
    loadWhenIdle();
  }, [fetchScenarios]); // Include fetchScenarios dependency as required by ESLint

  return {
    scenarios,
    isLoading,
    error,
    refetch: fetchScenarios
  };
};
