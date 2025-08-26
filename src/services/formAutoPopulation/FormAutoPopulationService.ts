import { ItemCategory } from '../../types';
import { FormField } from './types';
import { DetectedTags, AutoPopulationOptions, FormFieldSetter, FormFieldSetters } from './types';
import { Logger } from './utils/logger';
import { CategoryExtractor } from './extractors/categoryExtractor';
import { ColorExtractor } from './extractors/colorExtractor';
import { PatternExtractor } from './extractors/patternExtractor';
import { MaterialExtractor } from './extractors/materialExtractor';
import { BrandExtractor } from './extractors/brandExtractor';
import { SizeExtractor } from './extractors/sizeExtractor';
import { SeasonExtractor } from './extractors/seasonExtractor';
import { StyleExtractor } from './extractors/styleExtractor';
import { FootwearExtractor } from './extractors/footwearExtractor';
import { OuterwearExtractor } from './extractors/outerwearExtractor';
import { NameGenerator } from './extractors/nameGenerator';

/**
 * Service for automatically populating form fields based on detected tags from AI analysis
 */
export class FormAutoPopulationService {
  private logger: Logger;
  private categoryExtractor: CategoryExtractor;
  private colorExtractor: ColorExtractor;
  private patternExtractor: PatternExtractor;
  private materialExtractor: MaterialExtractor;
  private brandExtractor: BrandExtractor;
  private sizeExtractor: SizeExtractor;
  private seasonExtractor: SeasonExtractor;
  private styleExtractor: StyleExtractor;
  private footwearExtractor: FootwearExtractor;
  private outerwearExtractor: OuterwearExtractor;
  private nameGenerator: NameGenerator;

  constructor(enableLogging = false) {
    // Initialize logger
    this.logger = new Logger('[FormAutoPopulationService]', enableLogging);
    this.logger.debug('Initializing FormAutoPopulationService');
    
    // Initialize all extractors with the logger instance
    this.categoryExtractor = new CategoryExtractor(this.logger);
    this.colorExtractor = new ColorExtractor(this.logger);
    this.patternExtractor = new PatternExtractor(this.logger);
    this.materialExtractor = new MaterialExtractor(this.logger);
    this.brandExtractor = new BrandExtractor(this.logger);
    this.sizeExtractor = new SizeExtractor(this.logger);
    this.seasonExtractor = new SeasonExtractor(this.logger);
    this.styleExtractor = new StyleExtractor(this.logger);
    this.footwearExtractor = new FootwearExtractor(this.logger);
    this.outerwearExtractor = new OuterwearExtractor(this.logger);
    this.nameGenerator = new NameGenerator(this.logger);
  }

  /**
   * Enables or disables debug logging
   */
  setLoggingEnabled(enabled: boolean): void {
    if (enabled) {
      this.logger.enable();
    } else {
      this.logger.disable();
    }
  }

  /**
   * Main method to auto-populate form fields based on detected tags
   * @param tags Object containing detected tags from AI analysis
   * @param setField Callback function to set field values
   * @param options Configuration options for auto-population
   */
  autoPopulateFields(tags: DetectedTags, setField: FormFieldSetter, options: AutoPopulationOptions = {}): void {
    this.logger.debug('Auto-populating fields with options:', options);
    
    // Set default options
    const defaultOptions: AutoPopulationOptions = {
      overwriteExisting: false,
      skipFields: [],
    };
    
    // Merge provided options with defaults
    const mergedOptions: AutoPopulationOptions = { ...defaultOptions, ...options };
    
    // Extract category and subcategory first as they're needed for context in other extractors
    const extractedCategory = this.categoryExtractor.extractCategory(tags);
    const extractedSubcategory = this.categoryExtractor.extractSubcategory(tags, extractedCategory || undefined);
    
    this.populateCategoryFields(tags, setField, mergedOptions, extractedCategory || undefined, extractedSubcategory || undefined);
    
    // Category and subcategory already extracted above
    
    // Populate the remaining fields only if we have a category
    if (extractedCategory) {
      this.populateBasicFields(tags, setField, mergedOptions, extractedCategory, extractedSubcategory || '');
      this.populateSeasonalFields(tags, setField, mergedOptions, extractedCategory, extractedSubcategory || '');
      this.populateStyleFields(tags, setField, mergedOptions, extractedCategory, extractedSubcategory || '');
      this.populateFootwearFields(tags, setField, mergedOptions, extractedCategory, extractedSubcategory || '');
      this.populateOuterwearFields(tags, setField, mergedOptions, extractedCategory, extractedSubcategory || '');
      
      // Generate name last since it depends on other fields
      this.populateNameField(tags, setField, mergedOptions, extractedCategory, extractedSubcategory || '');
    }
    
    this.logger.debug('Auto-population complete');
  }


  /**
   * Populates category and subcategory fields
   */
  private populateCategoryFields(
    tags: DetectedTags, 
    setField: FormFieldSetter, 
    options: AutoPopulationOptions,
    extractedCategory?: ItemCategory,
    extractedSubcategory?: string
  ): void {
    const { overwriteExisting, skipFields } = options;
    
    this.logger.debug('[populateCategoryFields] Starting category field population');
    this.logger.debug('[populateCategoryFields] overwriteExisting:', overwriteExisting);
    this.logger.debug('[populateCategoryFields] skipFields:', skipFields);
    
    // Category
    if (!skipFields?.includes(FormField.CATEGORY) && extractedCategory) {
      if (overwriteExisting || this.shouldUpdateField(FormField.CATEGORY, options)) {
        this.logger.debug(`Setting category to: ${extractedCategory}`);
        setField(FormField.CATEGORY, extractedCategory);
      }
    }
    
    // Subcategory - use cached value
    if (!skipFields?.includes(FormField.SUBCATEGORY) && extractedSubcategory) {
      if (overwriteExisting || this.shouldUpdateField(FormField.SUBCATEGORY, options)) {
        this.logger.debug(`Setting subcategory to: ${extractedSubcategory}`);
        setField(FormField.SUBCATEGORY, extractedSubcategory);
      }
    }
    
    // Material
    if (!skipFields?.includes(FormField.MATERIAL)) {
      const material = this.materialExtractor.extractMaterial(tags);
      
      if (material && (overwriteExisting || this.shouldUpdateField(FormField.MATERIAL, options))) {
        this.logger.debug(`Setting material to: ${material}`);
        setField(FormField.MATERIAL, material);
      }
    }
  }

  /**
   * Populates basic fields: color, pattern, material, brand, size
   */
  private populateBasicFields(
    tags: DetectedTags, 
    setField: FormFieldSetter, 
    options: AutoPopulationOptions,
    category: ItemCategory,
    subcategory: string
  ): void {
    const { overwriteExisting, skipFields } = options;
    
    // Color
    if (!skipFields?.includes(FormField.COLOR)) {
      const color = this.colorExtractor.extractColor(tags);
      
      if (color && (overwriteExisting || this.shouldUpdateField(FormField.COLOR, options))) {
        this.logger.debug(`Setting color to: ${color}`);
        setField(FormField.COLOR, color);
      }
    }
    
    // Pattern
    if (!skipFields?.includes(FormField.PATTERN)) {
      const pattern = this.patternExtractor.extractPattern(tags);
      
      if (pattern && (overwriteExisting || this.shouldUpdateField(FormField.PATTERN, options))) {
        this.logger.debug(`Setting pattern to: ${pattern}`);
        setField(FormField.PATTERN, pattern);
      }
    }
    
    // Material
    if (!skipFields?.includes(FormField.MATERIAL)) {
      const material = this.materialExtractor.extractMaterial(tags);
      
      if (material && (overwriteExisting || this.shouldUpdateField(FormField.MATERIAL, options))) {
        this.logger.debug(`Setting material to: ${material}`);
        setField(FormField.MATERIAL, material);
      }
    }
    
    // Brand
    if (!skipFields?.includes(FormField.BRAND)) {
      const brand = this.brandExtractor.extractBrand(tags);
      
      if (brand && (overwriteExisting || this.shouldUpdateField(FormField.BRAND, options))) {
        this.logger.debug(`Setting brand to: ${brand}`);
        setField(FormField.BRAND, brand);
      }
    }
    
    // Size
    if (!skipFields?.includes(FormField.SIZE) && category) {
      const size = this.sizeExtractor.extractSize(tags, category);
      
      if (size && (overwriteExisting || this.shouldUpdateField(FormField.SIZE, options))) {
        this.logger.debug(`Setting size to: ${size}`);
        setField(FormField.SIZE, size);
      }
    }
  }

  /**
   * Populates seasonal fields (seasons)
   */
  private populateSeasonalFields(
    tags: DetectedTags, 
    setField: FormFieldSetter, 
    options: AutoPopulationOptions,
    category: ItemCategory,
    subcategory: string
  ): void {
    const { overwriteExisting, skipFields } = options;
    
    // Seasons
    if (!skipFields?.includes(FormField.SEASONS)) {
      const seasons = this.seasonExtractor.extractSeasons(tags);
      
      if (seasons && seasons.length > 0 && (overwriteExisting || this.shouldUpdateField(FormField.SEASONS, options))) {
        this.logger.debug(`Setting seasons to: ${seasons.join(', ')}`);
        setField(FormField.SEASONS, seasons);
      }
    }
  }

  /**
   * Populates style-related fields: style, silhouette, length, sleeves, rise
   */
  private populateStyleFields(
    tags: DetectedTags, 
    setField: FormFieldSetter, 
    options: AutoPopulationOptions,
    category: ItemCategory,
    subcategory: string
  ): void {
    const { overwriteExisting, skipFields } = options;
    
    // Style
    if (!skipFields?.includes(FormField.STYLE)) {
      this.logger.debug('[populateStyleFields] Extracting style...');
      const style = this.styleExtractor.extractStyle(tags);
      this.logger.debug('[populateStyleFields] Extracted style:', style);
      
      if (style && (overwriteExisting || this.shouldUpdateField(FormField.STYLE, options))) {
        this.logger.debug(`[populateStyleFields] Setting style to: ${style}`);
        setField(FormField.STYLE, style);
      } else {
        this.logger.debug('[populateStyleFields] Style not set - style:', style, 'overwriteExisting:', overwriteExisting);
      }
    } else {
      this.logger.debug('[populateStyleFields] Style field in skipFields, skipping');
    }
    
    // Silhouette - use already extracted subcategory
    if (!skipFields?.includes(FormField.SILHOUETTE) && category) {
      console.log('[DEBUG] Using cached subcategory for silhouette:', subcategory);
      const silhouette = this.styleExtractor.extractSilhouette(tags, category, subcategory || undefined);
      
      if (silhouette && (overwriteExisting || this.shouldUpdateField(FormField.SILHOUETTE, options))) {
        this.logger.debug(`Setting silhouette to: ${silhouette}` + (subcategory ? ` (for ${subcategory})` : ''));
        setField(FormField.SILHOUETTE, silhouette);
      }
    }
    
    // Length
    if (!skipFields?.includes(FormField.LENGTH) && category) {
      const length = this.styleExtractor.extractLength(tags, category);
      
      if (length && (overwriteExisting || this.shouldUpdateField(FormField.LENGTH, options))) {
        this.logger.debug(`Setting length to: ${length}`);
        setField(FormField.LENGTH, length);
      }
    }
    
    // Sleeves
    if (!skipFields?.includes(FormField.SLEEVES) && category) {
      const sleeves = this.styleExtractor.extractSleeves(tags, category);
      
      if (sleeves && (overwriteExisting || this.shouldUpdateField(FormField.SLEEVES, options))) {
        this.logger.debug(`Setting sleeves to: ${sleeves}`);
        setField(FormField.SLEEVES, sleeves);
      }
    }
    
    // Rise (for bottoms)
    if (!skipFields?.includes(FormField.RISE) && category) {
      this.logger.debug('[populateStyleFields] Extracting rise for category:', category);
      const rise = this.styleExtractor.extractRise(tags, category);
      this.logger.debug('[populateStyleFields] Extracted rise:', rise);
      
      if (rise && (overwriteExisting || this.shouldUpdateField(FormField.RISE, options))) {
        this.logger.debug(`[populateStyleFields] Setting rise to: ${rise}`);
        setField(FormField.RISE, rise);
      } else {
        this.logger.debug('[populateStyleFields] Rise not set - rise:', rise, 'category:', category);
      }
    } else {
      this.logger.debug('[populateStyleFields] Rise field skipped - inSkipFields:', skipFields?.includes(FormField.RISE), 'category:', category);
    }
  }

  /**
   * Populates footwear-specific fields: heel height, boot height, type
   */
  private populateFootwearFields(
    tags: DetectedTags, 
    setField: FormFieldSetter, 
    options: AutoPopulationOptions,
    category: ItemCategory,
    subcategory: string
  ): void {
    if (category !== ItemCategory.FOOTWEAR) return;
    
    const { overwriteExisting, skipFields } = options;
    
    // Heel Height
    if (!skipFields?.includes(FormField.HEEL_HEIGHT)) {
      const heelHeight = this.footwearExtractor.extractHeelHeight(tags, category);
      
      if (heelHeight && (overwriteExisting || this.shouldUpdateField(FormField.HEEL_HEIGHT, options))) {
        this.logger.debug(`Setting heel height to: ${heelHeight}`);
        setField(FormField.HEEL_HEIGHT, heelHeight);
      }
    }
    
    // Boot Height (only for boots)
    if (!skipFields?.includes(FormField.BOOT_HEIGHT) && subcategory && subcategory.toLowerCase().includes('boot')) {
      const bootHeight = this.footwearExtractor.extractBootHeight(tags, category, subcategory);
      
      if (bootHeight && (overwriteExisting || this.shouldUpdateField(FormField.BOOT_HEIGHT, options))) {
        this.logger.debug(`Setting boot height to: ${bootHeight}`);
        setField(FormField.BOOT_HEIGHT, bootHeight);
      }
    }
    
    // Type
    if (!skipFields?.includes(FormField.TYPE)) {
      const type = this.footwearExtractor.extractType(tags, category, subcategory);
      
      if (type && (overwriteExisting || this.shouldUpdateField(FormField.TYPE, options))) {
        this.logger.debug(`Setting type to: ${type}`);
        setField(FormField.TYPE, type);
      }
    }
  }

  /**
   * Populates outerwear-specific fields: type
   */
  private populateOuterwearFields(
    tags: DetectedTags, 
    setField: FormFieldSetter, 
    options: AutoPopulationOptions,
    category: ItemCategory,
    subcategory: string
  ): void {
    if (category !== ItemCategory.OUTERWEAR) return;
    
    const { overwriteExisting, skipFields } = options;
    
    // Type
    if (!skipFields?.includes(FormField.TYPE)) {
      const type = this.outerwearExtractor.extractType(tags, category, subcategory);
      
      if (type && (overwriteExisting || this.shouldUpdateField(FormField.TYPE, options))) {
        this.logger.debug(`Setting type to: ${type}`);
        setField(FormField.TYPE, type);
      }
    }
  }

  /**
   * Populates the name field
   */
  private populateNameField(
    tags: DetectedTags, 
    setField: FormFieldSetter, 
    options: AutoPopulationOptions,
    category: ItemCategory,
    subcategory: string
  ): void {
    const { overwriteExisting, skipFields } = options;
    
    if (!skipFields?.includes(FormField.NAME)) {
      const name = this.nameGenerator.generateName(tags, category, subcategory);
      
      if (name && (overwriteExisting || this.shouldUpdateField(FormField.NAME, options))) {
        this.logger.debug(`Setting name to: ${name}`);
        setField(FormField.NAME, name);
      }
    }
  }

  /**
   * Checks if a field should be updated based on auto-population settings
   * Since we don't have access to current form values, we default to allowing updates
   * unless the field is explicitly skipped
   */
  private shouldUpdateField(field: FormField, options: AutoPopulationOptions): boolean {
    const { skipFields } = options;
    
    if (skipFields?.includes(field)) {
      this.logger.debug(`Skipping ${field} as it's in skipFields`);
      return false;
    }
    
    // For auto-population, we should populate empty fields by default
    return true;
  }

  /**
   * Static method for backward compatibility with existing form integration
   */
  static async autoPopulateFromTags(
    tags: DetectedTags, 
    setters: FormFieldSetters, 
    options: AutoPopulationOptions = {}
  ): Promise<void> {
    const service = new FormAutoPopulationService(true);
    
    // Create a setField function that maps to the provided setters
    const setField: FormFieldSetter = (field: FormField, value: any) => {
      console.log('[FormAutoPopulationService] setField called with:', field, value);
      switch (field) {
        case FormField.CATEGORY:
          console.log('[FormAutoPopulationService] Calling setCategory with:', value);
          setters.setCategory?.(value);
          break;
        case FormField.SUBCATEGORY:
          setters.setSubcategory?.(value);
          break;
        case FormField.TYPE:
          setters.setType?.(value);
          break;
        case FormField.COLOR:
          setters.setColor?.(value);
          break;
        case FormField.PATTERN:
          setters.setPattern?.(value);
          break;
        case FormField.MATERIAL:
          setters.setMaterial?.(value);
          break;
        case FormField.BRAND:
          setters.setBrand?.(value);
          break;
        case FormField.SIZE:
          setters.setSize?.(value);
          break;
        case FormField.SEASONS:
          // Handle seasons by toggling each one individually
          if (Array.isArray(value)) {
            value.forEach((season) => setters.toggleSeason?.(season));
          }
          break;
        case FormField.STYLE:
          console.log('[FormAutoPopulationService] Calling setStyle with:', value);
          console.log('[FormAutoPopulationService] setStyle function exists:', !!setters.setStyle);
          if (setters.setStyle) {
            setters.setStyle(value);
            console.log('[FormAutoPopulationService] setStyle called successfully');
          } else {
            console.log('[FormAutoPopulationService] ERROR: setStyle function is undefined!');
          }
          break;
        case FormField.SILHOUETTE:
          setters.setSilhouette?.(value);
          break;
        case FormField.LENGTH:
          setters.setLength?.(value);
          break;
        case FormField.SLEEVES:
          setters.setSleeves?.(value);
          break;
        case FormField.RISE:
          setters.setRise?.(value);
          break;
        case FormField.HEEL_HEIGHT:
          setters.setHeelHeight?.(value);
          break;
        case FormField.BOOT_HEIGHT:
          setters.setBootHeight?.(value);
          break;
        case FormField.NAME:
          setters.setName?.(value);
          break;
        default:
          service.logger.debug(`Unknown field: ${field}`);
      }
    };

    // Use the main auto-population method
    service.autoPopulateFields(tags, setField, options);
  }
}
