/**
 * Types related to wardrobe context and outfits
 */
import { Season, Capsule, WardrobeItem } from '../types';

// Re-export WardrobeItem for components that need it
export type { WardrobeItem };

/**
 * Interface for detected tags from image analysis
 */
export interface DetectedTags {
  [key: string]: string | number | boolean | null;
}

/**
 * Outfit-related types for WardrobeContext
 */

// Base outfit interface with all possible fields
export interface OutfitBase {
  id: string;
  userId: string;
  name: string;
  items: string[];
  dateCreated: string;
  season: Season[];
  scenarios?: string[];
  scenarioNames?: string[];
}

// Input type for creating/updating outfits
export type OutfitInput = {
  name: string;
  items?: string[];
  season?: Season[];
  scenarios?: string[];
  scenarioNames?: string[];
  userId?: string;
  dateCreated?: string;
};

// Extended outfit type used in WardrobeContext
export type OutfitExtended = OutfitBase;

/**
 * WardrobeContext state interface
 */
export interface WardrobeContextState {
  items: WardrobeItem[];
  outfits: OutfitExtended[];
  capsules: Capsule[];
  addItem: (item: Omit<WardrobeItem, 'id'>, file?: File) => Promise<WardrobeItem | null>;
  updateItem: (id: string, updates: Partial<WardrobeItem>, file?: File) => Promise<WardrobeItem | null>;
  deleteItem: (id: string) => Promise<boolean>;
  addOutfit: (outfit: Omit<OutfitExtended, 'id' | 'dateCreated'>) => Promise<OutfitExtended | null>;
  updateOutfit: (id: string, updates: Partial<Omit<OutfitExtended, 'id' | 'userId' | 'dateCreated'>>) => Promise<OutfitExtended | null>;
  deleteOutfit: (id: string) => Promise<boolean>;
  addCapsule: (capsule: Omit<Capsule, 'id' | 'dateCreated'>) => Promise<Capsule | null>;
  updateCapsule: (id: string, updates: Partial<Capsule>) => Promise<Capsule | null>;
  deleteCapsule: (id: string) => Promise<boolean>;
  loadCapsules: () => Promise<void>;
  loadOutfits: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}
