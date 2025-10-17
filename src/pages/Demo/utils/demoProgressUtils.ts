import { DemoStep } from '../types';

const DEMO_PROGRESS_KEY = 'demoProgress';

export interface DemoProgress {
  currentStep: DemoStep;
  completedSteps: DemoStep[];
  lastUpdated: string;
}

/**
 * Save demo progress to localStorage
 */
export const saveDemoProgress = (currentStep: DemoStep, completedSteps: Set<DemoStep>) => {
  try {
    const progress: DemoProgress = {
      currentStep,
      completedSteps: Array.from(completedSteps),
      lastUpdated: new Date().toISOString()
    };
    
    localStorage.setItem(DEMO_PROGRESS_KEY, JSON.stringify(progress));
    console.log('🎭 Demo: Progress saved:', progress);
  } catch (error) {
    console.warn('Failed to save demo progress:', error);
  }
};

/**
 * Load demo progress from localStorage
 */
export const loadDemoProgress = (): DemoProgress | null => {
  try {
    const saved = localStorage.getItem(DEMO_PROGRESS_KEY);
    if (!saved) return null;
    
    const progress: DemoProgress = JSON.parse(saved);
    console.log('🎭 Demo: Progress loaded:', progress);
    return progress;
  } catch (error) {
    console.warn('Failed to load demo progress:', error);
    return null;
  }
};

/**
 * Clear demo progress (for reset functionality)
 */
export const clearDemoProgress = () => {
  try {
    localStorage.removeItem(DEMO_PROGRESS_KEY);
    console.log('🎭 Demo: Progress cleared');
  } catch (error) {
    console.warn('Failed to clear demo progress:', error);
  }
};

/**
 * Check if user has any demo progress saved
 */
export const hasDemoProgress = (): boolean => {
  return localStorage.getItem(DEMO_PROGRESS_KEY) !== null;
};
