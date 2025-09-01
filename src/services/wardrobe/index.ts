// Legacy imports for backward compatibility
import * as itemServiceImports from './items/itemService';
import * as updateItemImageUrlImports from './items/updateItemImageUrl';
import * as outfitServiceImports from './outfits/outfitService';
import * as outfitsServiceImports from './outfits/outfitsService';
import * as outfitItemServiceImports from './outfits/outfitItemService';
import * as capsuleItemServiceImports from './capsules/capsuleItemService';

/**
 * Services/wardrobe exports index
 * Provides centralized export of all wardrobe-related services
 * 
 * @deprecated Import directly from specific feature folders (e.g., 'wardrobe/items', 'wardrobe/outfits')
 */

// Re-export from feature folders
export * from './items';
export * from './outfits';
export * from './capsules';

// Legacy namespace exports (deprecated)
/** @deprecated Use import from 'wardrobe/items' */
export const wardrobeItemsService = itemServiceImports;
/** @deprecated Use import from 'wardrobe/items' */
export const updateItemImageUrl = updateItemImageUrlImports;
/** @deprecated Use import from 'wardrobe/outfits' */
export const outfitService = outfitServiceImports;
/** @deprecated Use import from 'wardrobe/outfits' */
export const outfitsService = outfitsServiceImports;
/** @deprecated Use import from 'wardrobe/outfits' */
export const outfitItemsService = outfitItemServiceImports;
/** @deprecated Use import from 'wardrobe/capsules' */
export const capsuleItemsService = capsuleItemServiceImports;

// Re-export commonly used functions directly
export const generateSignedUrl = itemServiceImports.generateSignedUrl;
export const migrateLocalStorageItemsToSupabase = itemServiceImports.migrateLocalStorageItemsToSupabase;
