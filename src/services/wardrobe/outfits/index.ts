/**
 * Outfit services barrel file
 * Re-exports all outfit-related functionality from modular service files
 */

// Import from outfitItemService for backward compatibility objects
import {
  addItemToOutfit,
  removeItemFromOutfit,
  getItemOutfits,
  addItemsToOutfit,
  removeAllItemsFromOutfit,
  removeItemFromAllOutfits,
  getItemIdsForOutfit
} from './outfitItemService';

// Import from outfitsService for backward compatibility
import {
  getOutfits,
  addOutfit,
  updateOutfit as updateOutfitFromService,
  deleteOutfit as deleteOutfitFromService,
  migrateLocalStorageOutfitsToSupabase
} from './outfitsService';

// Import from new modular services for object creation
import {
  fetchOutfits,
  createOutfit,
  updateOutfit,
  deleteOutfit
} from './outfitCrudService';

import {
  checkOutfitTablesExist,
  findOutfitsBySeason,
  findOutfitsByScenario,
  findOutfitsByItem,
  findFavoriteOutfits
} from './outfitQueryService';

import {
  migrateOutfitsToSupabase,
  checkMigrationStatus
} from './outfitMigrationService';

import {
  getOutfitItems,
  getOutfitScenarios,
  addItemsToOutfit as addItemsToOutfitNew,
  removeItemsFromOutfit,
  addScenariosToOutfit,
  removeScenariosFromOutfit,
  replaceOutfitItems,
  replaceOutfitScenarios
} from './outfitRelationsService';

// Base service exports
export * from './outfitBaseService';

// CRUD service exports
export {
  fetchOutfits,
  createOutfit,
  updateOutfit,
  deleteOutfit,
  fetchOutfitsFromSupabase,
  createOutfitInSupabase,
  updateOutfitInSupabase,
  deleteOutfitInSupabase
} from './outfitCrudService';

// Query service exports
export {
  checkOutfitTablesExist,
  findOutfitsBySeason,
  findOutfitsByScenario,
  findOutfitsByItem,
  findFavoriteOutfits
} from './outfitQueryService';

// Migration service exports
export {
  migrateOutfitsToSupabase,
  checkMigrationStatus
} from './outfitMigrationService';

// Relations service exports
export {
  getOutfitItems,
  getOutfitScenarios,
  addItemsToOutfit as addOutfitItemsNew,
  removeItemsFromOutfit,
  addScenariosToOutfit,
  removeScenariosFromOutfit,
  replaceOutfitItems,
  replaceOutfitScenarios
} from './outfitRelationsService';

// Legacy exports for backward compatibility
export { 
  getOutfits, 
  addOutfit, 
  updateOutfit as updateOutfitLegacy, 
  deleteOutfit as deleteOutfitLegacy, 
  migrateLocalStorageOutfitsToSupabase 
} from './outfitsService';

// Legacy exports from outfitItemService
export { 
  addItemToOutfit, 
  removeItemFromOutfit, 
  getItemOutfits, 
  removeAllItemsFromOutfit, 
  removeItemFromAllOutfits, 
  getItemIdsForOutfit 
} from './outfitItemService';

// Create outfit service object for backward compatibility
export const outfitService = {
  fetchOutfits,
  createOutfit,
  updateOutfit,
  deleteOutfit,
  checkOutfitsTableExists: checkOutfitTablesExist, // map to new function
  migrateOutfitsToSupabase
};

// For backward compatibility
export const outfitItemsService = {
  addItemToOutfit,
  removeItemFromOutfit,
  getOutfitItems,
  getItemOutfits,
  addItemsToOutfit,
  removeAllItemsFromOutfit,
  removeItemFromAllOutfits,
  getItemIdsForOutfit
};

// Deprecation aliases for backward compatibility
export const checkOutfitsTableExists = checkOutfitTablesExist;
