import { ItemCategory, Season } from '../../../../../../types';

/**
 * Props interface for the DetailsFields component
 * Contains all form field values, handlers, and configuration
 */
export interface DetailsFieldsProps {
  // Basic fields
  material: string;
  onMaterialChange: (material: string) => void;
  brand: string;
  onBrandChange: (brand: string) => void;
  price: string;
  onPriceChange: (price: string) => void;
  pattern: string;
  onPatternChange: (pattern: string) => void;
  
  // Style-specific fields
  silhouette: string;
  onSilhouetteChange: (silhouette: string) => void;
  length: string;
  onLengthChange: (length: string) => void;
  sleeves: string;
  onSleeveChange: (sleeve: string) => void;
  style: string;
  onStyleChange: (style: string) => void;
  rise: string;
  onRiseChange: (rise: string) => void;
  neckline: string;
  onNecklineChange: (neckline: string) => void;
  
  // Footwear-specific fields
  heelHeight: string;
  onHeelHeightChange: (heelHeight: string) => void;
  bootHeight: string;
  onBootHeightChange: (bootHeight: string) => void;
  
  // Type field (for various categories)
  type: string;
  onTypeChange: (type: string) => void;
  
  // Scenarios and seasons
  scenarios: string[];
  onScenarioToggle: (scenarioId: string) => void;
  seasons: Season[];
  onToggleSeason: (season: Season) => void;
  
  // Wishlist
  isWishlistItem: boolean;
  onWishlistToggle: (isWishlist: boolean) => void;
  
  // Context for field visibility
  category: ItemCategory | '';
  subcategory: string;
  
  // Form validation
  errors: { [key: string]: string };
}

/**
 * Configuration for which fields should be shown based on category/subcategory
 */
export interface FieldVisibilityConfig {
  shouldShowSilhouette: boolean;
  shouldShowLength: boolean;
  shouldShowSleeves: boolean;
  shouldShowStyle: boolean;
  shouldShowNeckline: boolean;
  shouldShowRise: boolean;
  shouldShowHeelHeight: boolean;
  shouldShowBootHeight: boolean;
  shouldShowType: boolean;
}
