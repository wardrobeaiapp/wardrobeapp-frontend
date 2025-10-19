/**
 * Utility exports for wardrobe items hook
 * Provides clean imports for all utility functions
 */

// Async utilities
export { yieldToMain, parseLocalStorageAsync } from './asyncUtils';

// Data loading utilities
export { loadWardrobeItems } from './dataLoader';

// Image upload utilities
export { handleImageUpload } from './imageUploadUtils';

// Optimistic update utilities
export {
  createOptimisticItem,
  addOptimisticItem,
  updateOptimisticItem,
  removeOptimisticItem,
  replaceOptimisticItem,
  revertOptimisticUpdate,
  restoreDeletedItem
} from './optimisticUpdates';
