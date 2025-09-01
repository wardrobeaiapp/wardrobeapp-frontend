// Import all functions from capsuleItemService
import {
  fetchCapsuleItems,
  addItemsToCapsule,
  removeItemsFromCapsule,
  replaceAllCapsuleItems,
  getItemCapsules
} from './capsuleItemService';

// Re-export all functions
export {
  fetchCapsuleItems,
  addItemsToCapsule,
  removeItemsFromCapsule,
  replaceAllCapsuleItems,
  getItemCapsules
};

// For backward compatibility with old imports
export const capsuleItemsService = {
  fetchCapsuleItems,
  addItemsToCapsule,
  removeItemsFromCapsule,
  replaceAllCapsuleItems,
  getItemCapsules
};

// Default export for backward compatibility
export default {
  fetchCapsuleItems,
  addItemsToCapsule,
  removeItemsFromCapsule,
  replaceAllCapsuleItems,
  getItemCapsules,
  // Legacy export
  capsuleItemsService
};
