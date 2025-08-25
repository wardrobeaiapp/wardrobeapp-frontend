import { ItemCategory, Season } from '../../types';
import { FormField } from './types';
import { DetectedTags, AutoPopulationOptions, FormFieldSetter } from './types';
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
import { NameGenerator } from './extractors/nameGenerator';
import { ExtractionHelpers } from './utils/extractionHelpers';

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
    this.populateCategoryFields(tags, setField, mergedOptions);
    
    // Get the current category and subcategory for context
    const currentCategory = this.getCurrentFieldValue(FormField.CATEGORY, setField) as ItemCategory;
    const currentSubcategory = this.getCurrentFieldValue(FormField.SUBCATEGORY, setField) as string;
    
    // Populate the remaining fields
    this.populateBasicFields(tags, setField, mergedOptions, currentCategory, currentSubcategory);
    this.populateSeasonalFields(tags, setField, mergedOptions, currentCategory, currentSubcategory);
    this.populateStyleFields(tags, setField, mergedOptions, currentCategory, currentSubcategory);
    this.populateFootwearFields(tags, setField, mergedOptions, currentCategory, currentSubcategory);
    
    // Generate name last since it depends on other fields
    this.populateNameField(tags, setField, mergedOptions, currentCategory, currentSubcategory);
    
    this.logger.debug('Auto-population complete');
  }

  /**
   * Gets the current value of a field using the setter callback
   */
  private getCurrentFieldValue(field: FormField, setField: FormFieldSetter): any {
    let currentValue: any = null;
    
    // Use the setter to get the current value
    setField(field, (value: any) => {
      currentValue = value;
      return value; // Return unchanged value
    });
    
    return currentValue;
  }

  /**
   * Populates category and subcategory fields
   */
  private populateCategoryFields(tags: DetectedTags, setField: FormFieldSetter, options: AutoPopulationOptions): void {
    const { overwriteExisting, skipFields } = options;
    
    // Skip fields if in skipFields array
    if (!skipFields?.includes(FormField.CATEGORY)) {
      const category = this.categoryExtractor.extractCategory(tags);
      
      if (category && (overwriteExisting || this.shouldUpdateField(FormField.CATEGORY, setField))) {
        this.logger.debug(`Setting category to: ${category}`);
        setField(FormField.CATEGORY, category);
      }
    }
    
    // Get the current category for subcategory extraction
    const currentCategory = this.getCurrentFieldValue(FormField.CATEGORY, setField) as ItemCategory;
    
    if (!skipFields?.includes(FormField.SUBCATEGORY) && currentCategory) {
      const subcategory = this.categoryExtractor.extractSubcategory(tags, currentCategory);
      
      if (subcategory && (overwriteExisting || this.shouldUpdateField(FormField.SUBCATEGORY, setField))) {
        this.logger.debug(`Setting subcategory to: ${subcategory}`);
        setField(FormField.SUBCATEGORY, subcategory);
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
      
      if (color && (overwriteExisting || this.shouldUpdateField(FormField.COLOR, setField))) {
        this.logger.debug(`Setting color to: ${color}`);
        setField(FormField.COLOR, color);
      }
    }
    
    // Pattern
    if (!skipFields?.includes(FormField.PATTERN)) {
      const pattern = this.patternExtractor.extractPattern(tags);
      
      if (pattern && (overwriteExisting || this.shouldUpdateField(FormField.PATTERN, setField))) {
        this.logger.debug(`Setting pattern to: ${pattern}`);
        setField(FormField.PATTERN, pattern);
      }
    }
    
    // Material
    if (!skipFields?.includes(FormField.MATERIAL)) {
      const material = this.materialExtractor.extractMaterial(tags);
      
      if (material && (overwriteExisting || this.shouldUpdateField(FormField.MATERIAL, setField))) {
        this.logger.debug(`Setting material to: ${material}`);
        setField(FormField.MATERIAL, material);
      }
    }
    
    // Brand
    if (!skipFields?.includes(FormField.BRAND)) {
      const brand = this.brandExtractor.extractBrand(tags);
      
      if (brand && (overwriteExisting || this.shouldUpdateField(FormField.BRAND, setField))) {
        this.logger.debug(`Setting brand to: ${brand}`);
        setField(FormField.BRAND, brand);
      }
    }
    
    // Size
    if (!skipFields?.includes(FormField.SIZE) && category) {
      const size = this.sizeExtractor.extractSize(tags, category);
      
      if (size && (overwriteExisting || this.shouldUpdateField(FormField.SIZE, setField))) {
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
      
      if (seasons && seasons.length > 0 && (overwriteExisting || this.shouldUpdateField(FormField.SEASONS, setField))) {
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
      const style = this.styleExtractor.extractStyle(tags);
      
      if (style && (overwriteExisting || this.shouldUpdateField(FormField.STYLE, setField))) {
        this.logger.debug(`Setting style to: ${style}`);
        setField(FormField.STYLE, style);
      }
    }
    
    // Silhouette
    if (!skipFields?.includes(FormField.SILHOUETTE) && category) {
      const silhouette = this.styleExtractor.extractSilhouette(tags, category);
      
      if (silhouette && (overwriteExisting || this.shouldUpdateField(FormField.SILHOUETTE, setField))) {
        this.logger.debug(`Setting silhouette to: ${silhouette}`);
        setField(FormField.SILHOUETTE, silhouette);
      }
    }
    
    // Length
    if (!skipFields?.includes(FormField.LENGTH) && category) {
      const length = this.styleExtractor.extractLength(tags, category);
      
      if (length && (overwriteExisting || this.shouldUpdateField(FormField.LENGTH, setField))) {
        this.logger.debug(`Setting length to: ${length}`);
        setField(FormField.LENGTH, length);
      }
    }
    
    // Sleeves
    if (!skipFields?.includes(FormField.SLEEVES) && category) {
      const sleeves = this.styleExtractor.extractSleeves(tags, category);
      
      if (sleeves && (overwriteExisting || this.shouldUpdateField(FormField.SLEEVES, setField))) {
        this.logger.debug(`Setting sleeves to: ${sleeves}`);
        setField(FormField.SLEEVES, sleeves);
      }
    }
    
    // Rise (for bottoms)
    if (!skipFields?.includes(FormField.RISE) && category) {
      const rise = this.styleExtractor.extractRise(tags, category);
      
      if (rise && (overwriteExisting || this.shouldUpdateField(FormField.RISE, setField))) {
        this.logger.debug(`Setting rise to: ${rise}`);
        setField(FormField.RISE, rise);
      }
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
      
      if (heelHeight && (overwriteExisting || this.shouldUpdateField(FormField.HEEL_HEIGHT, setField))) {
        this.logger.debug(`Setting heel height to: ${heelHeight}`);
        setField(FormField.HEEL_HEIGHT, heelHeight);
      }
    }
    
    // Boot Height (only for boots)
    if (!skipFields?.includes(FormField.BOOT_HEIGHT) && subcategory && subcategory.toLowerCase().includes('boot')) {
      const bootHeight = this.footwearExtractor.extractBootHeight(tags, category, subcategory);
      
      if (bootHeight && (overwriteExisting || this.shouldUpdateField(FormField.BOOT_HEIGHT, setField))) {
        this.logger.debug(`Setting boot height to: ${bootHeight}`);
        setField(FormField.BOOT_HEIGHT, bootHeight);
      }
    }
    
    // Type
    if (!skipFields?.includes(FormField.TYPE)) {
      const type = this.footwearExtractor.extractType(tags, category, subcategory);
      
      if (type && (overwriteExisting || this.shouldUpdateField(FormField.TYPE, setField))) {
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
      
      if (name && (overwriteExisting || this.shouldUpdateField(FormField.NAME, setField))) {
        this.logger.debug(`Setting name to: ${name}`);
        setField(FormField.NAME, name);
      }
    }
  }

  /**
   * Checks if a field should be updated based on its current value
   */
  private shouldUpdateField(field: FormField, setField: FormFieldSetter): boolean {
    return ExtractionHelpers.shouldUpdateField(field, setField);
  }
}
