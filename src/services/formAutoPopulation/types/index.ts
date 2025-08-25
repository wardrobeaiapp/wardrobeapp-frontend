import { Season, ItemCategory } from '../../../types';

/**
 * Enum for form field names used in auto-population
 */
export enum FormField {
  NAME = 'name',
  CATEGORY = 'category',
  SUBCATEGORY = 'subcategory',
  COLOR = 'color',
  PATTERN = 'pattern',
  MATERIAL = 'material',
  BRAND = 'brand',
  SIZE = 'size',
  SILHOUETTE = 'silhouette',
  LENGTH = 'length',
  SLEEVES = 'sleeves',
  STYLE = 'style',
  RISE = 'rise',
  HEEL_HEIGHT = 'heelHeight',
  BOOT_HEIGHT = 'bootHeight',
  TYPE = 'type',
  SEASONS = 'seasons'
}

/**
 * Interface for detected tags from AI image analysis
 */
export interface DetectedTags {
  [key: string]: string | number | boolean | null;
}

/**
 * Options for auto-population behavior
 */
export interface AutoPopulationOptions {
  /** Whether to overwrite existing form values (default: false) */
  overwriteExisting?: boolean;
  /** List of field names to skip during auto-population */
  skipFields?: string[];
  /** Enable debug logging (default: false) */
  debug?: boolean;
}

/**
 * Setters for each form field that can be auto-populated
 */
export interface FormFieldSetters {
  setCategory?: (category: ItemCategory) => void;
  setSubcategory?: (subcategory: string) => void;
  setColor?: (color: string) => void;
  setPattern?: (pattern: string) => void;
  setMaterial?: (material: string) => void;
  setBrand?: (brand: string) => void;
  setSize?: (size: string) => void;
  setSilhouette?: (silhouette: string) => void;
  setSleeves?: (sleeves: string) => void;
  setStyle?: (style: string) => void;
  setRise?: (rise: string) => void;
  setNeckline?: (neckline: string) => void;
  setHeelHeight?: (heelHeight: string) => void;
  setBootHeight?: (bootHeight: string) => void;
  setType?: (type: string) => void;
  setLength?: (length: string) => void;
  setSeasons?: (seasons: Season[]) => void;
  setName?: (name: string) => void;
}

/**
 * Field extractor function type
 */
export type FieldExtractorFn<T> = (
  tags: DetectedTags,
  category?: ItemCategory,
  subcategory?: string
) => T | null;

/**
 * Function type for setting a form field value
 */
export type FormFieldSetter = (field: FormField, value: any) => void;
