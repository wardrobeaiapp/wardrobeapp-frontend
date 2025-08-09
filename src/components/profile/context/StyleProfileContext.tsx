/**
 * StyleProfileContext - Modular Entry Point
 * 
 * This file serves as the main entry point for the refactored StyleProfile system.
 * All functionality has been split into focused modules for better maintainability:
 * 
 * - types/StyleProfileTypes.ts - Type definitions and interfaces
 * - context/StyleProfileContext.ts - Context creation and hook  
 * - hooks/useStyleProfileLogic.ts - State management and event handlers
 * - services/StyleProfileSaveService.ts - Complex save logic
 * - components/StyleProfileProvider.tsx - Provider component implementation
 */

// Re-export the modular components and types for backward compatibility
export { StyleProfileContext, useStyleProfile } from './StyleProfileContext';
export { StyleProfileProvider } from '../components/StyleProfileProvider';
export type { SaveResult, StyleProfileContextType, StyleProfileProviderProps } from '../types/StyleProfileTypes';
