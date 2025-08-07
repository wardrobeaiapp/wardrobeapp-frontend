import { useState, useCallback, useEffect } from 'react';
import { useSupabaseAuth } from '../context/SupabaseAuthContext';
import { UserPreferences, defaultPreferences } from '../types/userPreferences';
import { supabasePreferencesService } from '../services/supabasePreferencesService';

/**
 * Hook for managing user preferences data using the new user_preferences table
 */
export const usePreferencesData = () => {
  const { user } = useSupabaseAuth();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user preferences from the new table
  const fetchPreferences = useCallback(async () => {
    if (!user?.id) {
      setPreferences(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const userPreferences = await supabasePreferencesService.getUserPreferences(user.id);
      
      if (userPreferences) {
        setPreferences(userPreferences);
      } else {
        // If no preferences found, use default with the user ID
        setPreferences({
          ...defaultPreferences,
          userId: user.id
        });
      }
    } catch (err) {
      console.error('Error fetching user preferences:', err);
      setError('Failed to load preferences data');
      
      // Set default preferences as fallback
      setPreferences({
        ...defaultPreferences,
        userId: user.id
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load preferences when user changes
  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  // Function to save preferences data
  const savePreferences = useCallback(async (updatedPreferences: Partial<UserPreferences>) => {
    if (!user?.id) {
      setError('User not authenticated');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const savedPreferences = await supabasePreferencesService.updateUserPreferences(
        user.id,
        updatedPreferences
      );

      if (savedPreferences) {
        setPreferences(savedPreferences);
        return true;
      } else {
        setError('Failed to save preferences');
        return false;
      }
    } catch (err) {
      console.error('Error saving preferences:', err);
      setError('An error occurred while saving preferences');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Function to update specific preference fields
  const updatePreference = useCallback(async (field: keyof UserPreferences, value: any) => {
    if (!preferences) return false;
    
    const updatedPreferences = {
      ...preferences,
      [field]: value
    };
    
    return savePreferences(updatedPreferences);
  }, [preferences, savePreferences]);

  return {
    preferences,
    loading,
    error,
    fetchPreferences,
    savePreferences,
    updatePreference
  };
};
