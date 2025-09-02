/**
 * Types related to outfits
 */

// Re-export Season from index to ensure consistent enum values
import { Season } from './index';

export { Season };

export interface OutfitInput {
  id?: string;
  name: string;
  description: string;
  items: string[];
  season: Season[];
  favorite: boolean;
  userId: string;
  dateCreated?: string;
  lastWorn?: string;
  occasion?: string;
  weather?: string[];
  tags?: string[];
  imageUrl?: string;
  scenarios?: string[];
}

export interface OutfitExtended extends Omit<OutfitInput, 'items'> {
  id: string;
  items: string[];
  dateCreated: string;
  userId: string;
  scenarios: string[];
  lastWorn?: string;
  occasion?: string;
  weather?: string[];
  tags?: string[];
  imageUrl?: string;
}
