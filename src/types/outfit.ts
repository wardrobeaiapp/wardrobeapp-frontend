/**
 * Types related to outfits
 */

import { WardrobeItem } from './wardrobe';

/**
 * Outfit interface
 */
export interface Outfit {
  id?: string;
  name: string;
  description?: string;
  occasion?: string;
  season?: string;
  items: string[] | WardrobeItem[];
  createdAt?: string;
  updatedAt?: string;
  imageUrl?: string;
}
