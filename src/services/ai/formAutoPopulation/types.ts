import { ItemCategory, Season } from '../../../types';

/**
 * Interface for detected tags from AI image analysis
 */
export interface DetectedTags {
  /** General tags detected in the image */
  general_tags?: string[];
  /** Fashion-specific tags detected in the image */
  fashion_tags?: string[];
  /** Color tags detected in the image */
  color_tags?: string[];
  /** Dominant colors detected in the image */
  dominant_colors?: string[];
  /** Pattern tags detected in the image */
  pattern_tags?: string[];
  /** Raw tag confidences with scores (may be useful for debugging) */
  raw_tag_confidences?: Record<string, number>;
}

/**
 * Options for auto-population behavior
 */
export interface AutoPopulationOptions {
  /** Whether to overwrite existing field values */
  overwriteExisting?: boolean;
  /** Array of fields to skip during auto-population */
  skipFields?: FormField[];
  /** Optional current field values for conditional checks */
  currentValues?: Record<string, any>;
  /** Enable debug logging */
  debug?: boolean;
}

/**
 * Form field setter function type
 */
export type FormFieldSetter = (field: FormField, value: any) => void;

/**
 * Collection of individual form field setter functions
 */
export interface FormFieldSetters {
  setCategory?: (value: ItemCategory) => void;
  setSubcategory?: (value: string) => void;
  setType?: (value: string) => void;
  setColor?: (value: string) => void;
  setPattern?: (value: string) => void;
  setMaterial?: (value: string) => void;
  setBrand?: (value: string) => void;
  setSize?: (value: string) => void;
  toggleSeason?: (value: Season) => void;
  setStyle?: (value: string) => void;
  setSilhouette?: (value: string) => void;
  setLength?: (value: string) => void;
  setSleeves?: (value: string) => void;
  setRise?: (value: string) => void;
  setNeckline?: (value: string) => void;
  setHeelHeight?: (value: string) => void;
  setBootHeight?: (value: string) => void;
  setName?: (value: string) => void;
}

/**
 * Enum for form field names to ensure consistency
 */
export enum FormField {
  CATEGORY = 'category',
  SUBCATEGORY = 'subcategory',
  TYPE = 'type',
  COLOR = 'color',
  PATTERN = 'pattern',
  MATERIAL = 'material',
  BRAND = 'brand',
  SIZE = 'size',
  SEASONS = 'seasons',
  STYLE = 'style',
  SILHOUETTE = 'silhouette',
  LENGTH = 'length',
  SLEEVES = 'sleeves',
  RISE = 'rise',
  NECKLINE = 'neckline',
  HEEL_HEIGHT = 'heelHeight',
  BOOT_HEIGHT = 'bootHeight',
  NAME = 'name'
}
