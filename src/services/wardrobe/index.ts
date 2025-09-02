// Legacy imports for backward compatibility
import * as updateItemImageUrlImports from './items/updateItemImageUrl';
import * as outfitServiceImports from './outfits/outfitService';
import * as outfitsServiceImports from './outfits/outfitsService';
import * as outfitItemServiceImports from './outfits/outfitItemService';
import * as capsuleItemServiceImports from './capsules/capsuleItemService';

// Import directly from modular service files
import { generateSignedUrl } from './items/itemImageService';
import { migrateLocalStorageItemsToSupabase } from './items/itemMigrationService';

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

// Re-export these directly (already imported above)
export { generateSignedUrl, migrateLocalStorageItemsToSupabase };

// Legacy namespace exports (deprecated)
/** @deprecated Use import from 'wardrobe/items' */
export const wardrobeItemsService = {
  // Re-export from modular services to maintain compatibility
  // while avoiding direct dependency on itemService.ts
  ...require('./items').wardrobeItemsService
};

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
