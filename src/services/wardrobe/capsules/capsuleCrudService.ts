/**
 * Capsule CRUD Service
 * 
 * This file serves as a centralized entry point for capsule CRUD operations,
 * re-exporting functionality from specialized modules.
 */


// Re-export core functionality from specialized modules
export { fetchCapsulesFromDB as fetchCapsules } from './capsuleQueryService';
export { createCapsule } from './capsuleCreateService';
export { updateCapsule } from './capsuleUpdateService';
export { deleteCapsule } from './capsuleDeleteService';

// Re-export helper utilities that are used across modules
export { 
  resetCapsuleCache,
  validateCapsuleExists
} from './capsuleCrudHelpers';

// Export types and constants for external consumers
export { 
  CAPSULES_TABLE,
  CAPSULE_ITEMS_TABLE,
  CAPSULE_SCENARIOS_TABLE,
  API_URL,
  getAuthHeaders,
  apiRequest,
  isGuestModeEnabled
} from './capsuleBaseService';
