/**
 * StylePreferencesContext - Modular Entry Point
 * 
 * This file serves as the main entry point for the StylePreferences context system.
 * It follows the same modular pattern as StyleProfileContext and WardrobeGoalsService.
 */

// Re-export the context and hook for ease of use
export { StylePreferencesContext, useStylePreferences } from '../StylePreferencesContext';
export { StylePreferencesProvider } from '../../components/StylePreferencesProvider';

// Re-export types
export type { StylePreferencesContextType } from '../StylePreferencesContext';
