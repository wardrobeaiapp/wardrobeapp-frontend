import { createContext, useContext } from 'react';
import { StylePreferencesData } from '../../../../types';

/**
 * StylePreferencesContext type definition
 */
export interface StylePreferencesContextType {
  /** Current style preferences data */
  stylePreferencesData: StylePreferencesData;
  /** Original style preferences data (for comparing changes) */
  originalData: StylePreferencesData;
  /** Function to update style preferences data */
  setStylePreferencesData: (data: StylePreferencesData) => void;
  /** Function to save style preferences data */
  saveStylePreferences: () => Promise<{ success: boolean; error?: any }>;
  /** Loading state during fetch operations */
  isLoading: boolean;
  /** Error state during operations */
  error: string | null;
  /** Saving state during save operations */
  isSaving: boolean;
  /** Success modal state */
  isModalOpen: boolean;
  /** Function to close the success modal */
  closeModal: () => void;
}

// Create context with undefined default
export const StylePreferencesContext = createContext<StylePreferencesContextType | undefined>(undefined);

/**
 * Custom hook to use the StylePreferencesContext
 * @returns StylePreferencesContextType
 */
export const useStylePreferences = (): StylePreferencesContextType => {
  const context = useContext(StylePreferencesContext);
  if (context === undefined) {
    throw new Error('useStylePreferences must be used within a StylePreferencesProvider');
  }
  return context;
};
