/**
 * Services/wardrobe exports index
 * Provides centralized export of all wardrobe-related services
 */

// Import and re-export as namespaces to avoid naming conflicts
import * as wardrobeItemsServiceImports from './wardrobeItemsService';
import * as capsuleItemsServiceImports from './capsuleItemsService';
import * as outfitItemsServiceImports from './outfitItemsService';
import * as outfitServiceImports from './outfitService';
import * as outfitsServiceImports from './outfitsService';
import * as updateItemImageUrlImports from './updateItemImageUrl';

// Export as namespaces
export const wardrobeItemsService = wardrobeItemsServiceImports;
export const capsuleItemsService = capsuleItemsServiceImports;
export const outfitItemsService = outfitItemsServiceImports;
export const outfitService = outfitServiceImports;
export const outfitsService = outfitsServiceImports;
export const updateItemImageUrl = updateItemImageUrlImports;

// Re-export commonly used functions directly
export const generateSignedUrl = wardrobeItemsServiceImports.generateSignedUrl;
export const migrateLocalStorageItemsToSupabase = wardrobeItemsServiceImports.migrateLocalStorageItemsToSupabase;
