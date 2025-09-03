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
  userId: string;
  dateCreated?: string;
  occasion?: string;
  weather?: string[];
  tags?: string[];
  imageUrl?: string;
  scenarios?: string[];
  scenarioNames?: string[];
}

export interface OutfitExtended extends Omit<OutfitInput, 'items'> {
  id: string;
  items: string[];
  dateCreated: string;
  userId: string;
  scenarios: string[];
  scenarioNames?: string[];
  lastWorn?: string;
  occasion?: string;
  weather?: string[];
  tags?: string[];
  imageUrl?: string;
}
