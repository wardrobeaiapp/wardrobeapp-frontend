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
      
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) {
          console.error('Error getting authenticated user:', error);
          setError(error);
          return;
        }
        
        if (data?.user) {
          setUserId(data.user.id);
        }
      } catch (err) {
        console.error('Unexpected error getting user:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    };
    
    getUserId();
  }, []);

  return { userId, isLoading, error };
};
