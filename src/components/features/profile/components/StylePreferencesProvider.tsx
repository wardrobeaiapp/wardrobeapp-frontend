import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { StylePreferencesContext } from '../context/StylePreferencesContext';
import { StylePreferencesData } from '../../../../types';
import { getStylePreferencesData, saveStylePreferencesData } from '../../../../services/profile/stylePreferencesService';
import { useSupabaseAuth } from '../../../../context/SupabaseAuthContext';

// Default style preferences data
const defaultStylePreferencesData: StylePreferencesData = {
  preferredStyles: [],
  stylePreferences: {
    comfortVsStyle: 50,
    classicVsTrendy: 50,
    basicsVsStatements: 50,
    additionalNotes: ''
  }
};

interface StylePreferencesProviderProps {
  children: React.ReactNode;
  /** Optional initial data for the provider */
  initialData?: StylePreferencesData;
  /** Optional callback to run after successful save */
  onSave?: () => void;
}

/**
 * Provider component for StylePreferences data
 */
export const StylePreferencesProvider: React.FC<StylePreferencesProviderProps> = ({
  children,
  initialData,
  onSave
}) => {
  const { user } = useSupabaseAuth();
  const [stylePreferencesData, setStylePreferencesData] = useState<StylePreferencesData>(
    initialData || defaultStylePreferencesData
  );
  const [originalData, setOriginalData] = useState<StylePreferencesData>(
    initialData || defaultStylePreferencesData
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Fetch style preferences data on mount
  useEffect(() => {
    if (!user?.id) return;
    
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await getStylePreferencesData(user.id);
        if (data) {
          setStylePreferencesData(data);
          setOriginalData(data);
        } else {
          setStylePreferencesData(defaultStylePreferencesData);
          setOriginalData(defaultStylePreferencesData);
        }
      } catch (err) {
        console.error('Error fetching style preferences:', err);
        setError('Failed to load style preferences data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user?.id]);

  // Save style preferences data
  const saveStylePreferences = useCallback(async () => {
    if (!user?.id) {
      return { success: false, error: 'User not authenticated' };
    }
    
    setIsSaving(true);
    setError(null);
    
    try {
      await saveStylePreferencesData(user.id, stylePreferencesData);
      setOriginalData(stylePreferencesData); // Update original data after successful save
      setIsModalOpen(true);
      if (onSave) onSave();
      return { success: true };
    } catch (err) {
      console.error('Error saving style preferences:', err);
      setError('Failed to save style preferences data');
      return { success: false, error: err };
    } finally {
      setIsSaving(false);
    }
  }, [stylePreferencesData, user?.id, onSave]);

  // Close success modal
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  // Context value
  const contextValue = {
    stylePreferencesData,
    originalData,
    setStylePreferencesData,
    saveStylePreferences,
    isLoading,
    error,
    isSaving,
    isModalOpen,
    closeModal
  };

  return (
    <StylePreferencesContext.Provider value={contextValue}>
      {children}
    </StylePreferencesContext.Provider>
  );
};
