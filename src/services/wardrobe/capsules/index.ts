// Import all functions from capsuleItemService
import {
  fetchCapsuleItems,
  addItemsToCapsule,
  removeItemsFromCapsule,
  replaceAllCapsuleItems,
  getItemCapsules
} from './capsuleItemService';

// Import all functions from capsuleService
import {
  fetchCapsules,
  createCapsule,
  updateCapsule,
  deleteCapsule
} from './capsuleService';

// Re-export all functions
export {
  // Capsule item-related functions
  fetchCapsuleItems,
  addItemsToCapsule,
  removeItemsFromCapsule,
  replaceAllCapsuleItems,
  getItemCapsules,
  
  // Capsule-related functions
  fetchCapsules,
  createCapsule,
  updateCapsule,
  deleteCapsule
};

// For backward compatibility with old imports
export const capsuleItemsService = {
  fetchCapsuleItems,
  addItemsToCapsule,
  removeItemsFromCapsule,
  replaceAllCapsuleItems,
  getItemCapsules
};

// Add service object for capsule operations
export const capsuleService = {
  fetchCapsules,
  createCapsule,
  updateCapsule,
  deleteCapsule
};

// Default export for backward compatibility
export default {
  // Capsule item functions
  fetchCapsuleItems,
  addItemsToCapsule,
  removeItemsFromCapsule,
  replaceAllCapsuleItems,
  getItemCapsules,
  
  // Capsule functions
  fetchCapsules,
  createCapsule,
  updateCapsule,
  deleteCapsule,
  
  // Legacy exports
  capsuleItemsService,
  capsuleService
};
