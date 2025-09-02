import { supabase } from './core';
import { WardrobeItem, Outfit, ItemCategory, Season, WishlistStatus } from '../types';

// Add TypeScript declaration for the window.__loggedQueries property
declare global {
  interface Window {
    __loggedQueries?: string[];
  }
}

// ===== API MIGRATION NOTES =====
// All service-specific APIs have been moved to dedicated service modules

// WARDROBE ITEM API MOVED TO services/wardrobe/items
// Import wardrobe item functionality using:
/* Example:
import { fetchItems, createItem, updateItem, deleteItem } from '../services/wardrobe/items';
*/

// OUTFIT API MOVED TO services/wardrobe/outfits
// Import outfit functionality using:
/* Example:
import { fetchOutfits, createOutfit, updateOutfit, deleteOutfit } from '../services/wardrobe/outfits';
*/

// CAPSULE API MOVED TO services/wardrobe/capsules
// Import capsule functionality using:
/* Example:
import { fetchCapsules, createCapsule, updateCapsule, deleteCapsule } from '../services/wardrobe/capsules';
*/
