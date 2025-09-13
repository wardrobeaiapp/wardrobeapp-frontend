import { useState, useEffect } from 'react';
import { supabase } from '../../../../../../services/core/supabase';

/**
 * Custom hook to handle user authentication state
 * @returns Object containing userId and loading state
 */
export const useAuthUser = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const getUserId = async () => {
      setIsLoading(true);
      setError(null);
      
      // Defer to idle time to avoid blocking modal opening
      if ('requestIdleCallback' in window) {
        requestIdleCallback(async () => {
          try {
            const { data, error } = await supabase.auth.getUser();
            if (error) {
              setError(error);
              return;
            }
            
            if (data?.user) {
              setUserId(data.user.id);
            }
          } catch (err) {
            setError(err instanceof Error ? err : new Error(String(err)));
          } finally {
            setIsLoading(false);
          }
        }, { timeout: 500 });
      } else {
        // Fallback for older browsers
        setTimeout(async () => {
          try {
            const { data, error } = await supabase.auth.getUser();
            if (error) {
              setError(error);
              return;
            }
            
            if (data?.user) {
              setUserId(data.user.id);
            }
          } catch (err) {
            setError(err instanceof Error ? err : new Error(String(err)));
          } finally {
            setIsLoading(false);
          }
        }, 10);
      }
    };
    
    getUserId();
  }, []);

  return { userId, isLoading, error };
};
