// Import all functions from capsuleItemService
import {
  fetchCapsuleItems,
  addItemsToCapsule,
  removeItemsFromCapsule,
  replaceAllCapsuleItems,
  getItemCapsules
} from './capsuleItemService';

// Import capsule service functions from modular files
import { fetchCapsules, createCapsule, updateCapsule, deleteCapsule } from './capsuleCrudService';

// Import additional modular services
import { checkCapsuleTablesExist } from './capsuleQueryService';

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
  deleteCapsule,
  
  // Utility functions
  checkCapsuleTablesExist
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
  deleteCapsule,
  checkCapsuleTablesExist
};

// Named object for default export (to satisfy ESLint)
const capsuleOperations = {
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
  checkCapsuleTablesExist,
  
  // Legacy exports
  capsuleItemsService,
  capsuleService
};

// Default export for backward compatibility
export default capsuleOperations;
