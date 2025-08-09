import { createContext, useContext } from 'react';
import { StyleProfileContextType } from '../types/StyleProfileTypes';

// Create the context with a default value
export const StyleProfileContext = createContext<StyleProfileContextType | undefined>(undefined);

// Custom hook to use the context
export const useStyleProfile = (): StyleProfileContextType => {
  const context = useContext(StyleProfileContext);
  if (context === undefined) {
    throw new Error('useStyleProfile must be used within a StyleProfileProvider');
  }
  return context;
};
