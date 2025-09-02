// Import from outfitItemService
import {
  addItemToOutfit,
  removeItemFromOutfit,
  getOutfitItems,
  getItemOutfits,
  addItemsToOutfit,
  removeAllItemsFromOutfit,
  removeItemFromAllOutfits,
  getItemIdsForOutfit
} from './outfitItemService';

// Import from outfitService (needed for outfitService object creation)
import {
  fetchOutfits,
  createOutfit,
  updateOutfit,
  deleteOutfit,
  checkOutfitsTableExists,
  migrateOutfitsToSupabase
} from './outfitService';

// Export from outfitService
export { 
  fetchOutfits,
  createOutfit,
  updateOutfit,
  deleteOutfit,
  // Also export helpers and migrations
  checkOutfitsTableExists,
  migrateOutfitsToSupabase
} from './outfitService';

// Export from outfitsService for backward compatibility
export { 
  getOutfits, 
  addOutfit, 
  updateOutfit as updateOutfitFromService, 
  deleteOutfit as deleteOutfitFromService, 
  migrateLocalStorageOutfitsToSupabase 
} from './outfitsService';

// Create outfit service object for backward compatibility
export const outfitService = {
  fetchOutfits,
  createOutfit,
  updateOutfit,
  deleteOutfit,
  checkOutfitsTableExists,
  migrateOutfitsToSupabase
};

// Export from outfitItemService
export { 
  addItemToOutfit, 
  removeItemFromOutfit, 
  getOutfitItems, 
  getItemOutfits, 
  addItemsToOutfit, 
  removeAllItemsFromOutfit, 
  removeItemFromAllOutfits, 
  getItemIdsForOutfit 
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

// Export types from outfit-related services
export * from './outfitService';
export * from './outfitItemService';
export * from './outfitsService';
