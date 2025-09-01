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

// Export from outfitService
export { createOutfit } from './outfitService';

// Export from outfitsService
export { getOutfits, addOutfit, updateOutfit, deleteOutfit, migrateLocalStorageOutfitsToSupabase } from './outfitsService';

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
