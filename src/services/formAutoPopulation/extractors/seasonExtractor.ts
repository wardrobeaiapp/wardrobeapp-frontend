import { Season } from '../../../types';
import { DetectedTags, FieldExtractorFn } from '../types';
import { seasonMappings, getAllSeasons } from '../mappings/seasonMappings';
import { ExtractionHelpers } from '../utils/extractionHelpers';
import { Logger } from '../utils/logger';

/**
 * Extractor class for season-related fields
 */
export class SeasonExtractor {
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * Extracts the seasons from detected tags
   */
  extractSeasons: FieldExtractorFn<Season[]> = (tags) => {
    this.logger.debug('Extracting seasons from tags');
    
    const detectedSeasons = new Set<Season>();
    
    // First check for direct season tags
    const seasonTag = ExtractionHelpers.extractFromTags(tags, 'season', [
      'seasons', 'seasonal', 'weather'
    ]);
    
    if (seasonTag) {
      this.logger.debug('Found season tag:', seasonTag);
      this.addSeasonsFromText(seasonTag, detectedSeasons);
    }
    
    // Look for season keywords in all tag values
    for (const [key, value] of Object.entries(tags)) {
      if (typeof value !== 'string') continue;
      
      // Skip certain tags that are unlikely to contain season information
      const keyLower = key.toLowerCase();
      if (['category', 'subcategory', 'brand', 'size'].includes(keyLower)) {
        continue;
      }
      
      this.addSeasonsFromText(value, detectedSeasons);
    }
    
    // If no seasons detected, determine based on item characteristics (material, style, etc.)
    if (detectedSeasons.size === 0) {
      this.inferSeasonsFromItemProperties(tags, detectedSeasons);
    }
    
    // If still no seasons detected, default to all seasons
    if (detectedSeasons.size === 0) {
      this.logger.debug('No seasons detected, defaulting to all seasons');
      return getAllSeasons();
    }
    
    const result = Array.from(detectedSeasons);
    this.logger.debug('Detected seasons:', result);
    return result;
  };

  /**
   * Adds seasons from text based on season keywords
   */
  private addSeasonsFromText(text: string, seasonsSet: Set<Season>): void {
    if (!text) return;
    
    const lowerText = text.toLowerCase();
    
    // Check for direct season mentions first
    for (const season of getAllSeasons()) {
      if (lowerText.includes(season.toLowerCase())) {
        this.logger.debug(`Found direct season mention: ${season}`);
        seasonsSet.add(season);
      }
    }
    
    // Check for season keywords
    for (const [keyword, seasons] of Object.entries(seasonMappings)) {
      if (lowerText.includes(keyword.toLowerCase())) {
        this.logger.debug(`Found season keyword "${keyword}" mapping to:`, seasons);
        seasons.forEach(season => seasonsSet.add(season));
      }
    }
  }

  /**
   * Infers seasons based on item properties like material, color, style
   */
  private inferSeasonsFromItemProperties(tags: DetectedTags, seasonsSet: Set<Season>): void {
    // Check material for season hints
    const material = ExtractionHelpers.extractFromTags(tags, 'material', ['fabric']);
    if (material) {
      const lowerMaterial = material.toLowerCase();
      
      // Winter/Fall materials
      if (['wool', 'cashmere', 'fleece', 'velvet', 'corduroy', 'leather', 'fur', 'down', 'tweed']
          .some(m => lowerMaterial.includes(m))) {
        this.logger.debug(`Winter/Fall material detected: ${material}`);
        seasonsSet.add(Season.WINTER);
        seasonsSet.add(Season.FALL);
      }
      
      // Summer materials
      if (['linen', 'cotton', 'silk', 'chiffon', 'rayon', 'bamboo', 'mesh']
          .some(m => lowerMaterial.includes(m))) {
        this.logger.debug(`Summer material detected: ${material}`);
        seasonsSet.add(Season.SUMMER);
      }
      
      // Spring materials
      if (['cotton', 'light', 'chiffon', 'silk', 'polyester']
          .some(m => lowerMaterial.includes(m))) {
        this.logger.debug(`Spring material detected: ${material}`);
        seasonsSet.add(Season.SPRING);
      }
    }
    
    // Check color for season hints
    const color = ExtractionHelpers.extractFromTags(tags, 'color', ['hue']);
    if (color) {
      const lowerColor = color.toLowerCase();
      
      // Winter colors
      if (['navy', 'burgundy', 'dark green', 'gray', 'black', 'silver', 'white']
          .some(c => lowerColor.includes(c))) {
        this.logger.debug(`Winter color detected: ${color}`);
        seasonsSet.add(Season.WINTER);
      }
      
      // Fall colors
      if (['brown', 'orange', 'rust', 'mustard', 'olive', 'burgundy', 'maroon']
          .some(c => lowerColor.includes(c))) {
        this.logger.debug(`Fall color detected: ${color}`);
        seasonsSet.add(Season.FALL);
      }
      
      // Summer colors
      if (['bright', 'yellow', 'coral', 'turquoise', 'mint', 'light blue', 'pink']
          .some(c => lowerColor.includes(c))) {
        this.logger.debug(`Summer color detected: ${color}`);
        seasonsSet.add(Season.SUMMER);
      }
      
      // Spring colors
      if (['pastel', 'light green', 'light pink', 'lavender', 'mint', 'peach']
          .some(c => lowerColor.includes(c))) {
        this.logger.debug(`Spring color detected: ${color}`);
        seasonsSet.add(Season.SPRING);
      }
    }
    
    // Check style for season hints
    const style = ExtractionHelpers.extractFromTags(tags, 'style', ['look', 'design']);
    if (style) {
      const lowerStyle = style.toLowerCase();
      
      // Winter styles
      if (['winter', 'holiday', 'snow', 'cozy', 'warm', 'christmas']
          .some(s => lowerStyle.includes(s))) {
        this.logger.debug(`Winter style detected: ${style}`);
        seasonsSet.add(Season.WINTER);
      }
      
      // Fall styles
      if (['fall', 'autumn', 'harvest', 'school', 'rustic', 'layers']
          .some(s => lowerStyle.includes(s))) {
        this.logger.debug(`Fall style detected: ${style}`);
        seasonsSet.add(Season.FALL);
      }
      
      // Summer styles
      if (['summer', 'beach', 'vacation', 'tropical', 'resort', 'swim']
          .some(s => lowerStyle.includes(s))) {
        this.logger.debug(`Summer style detected: ${style}`);
        seasonsSet.add(Season.SUMMER);
      }
      
      // Spring styles
      if (['spring', 'floral', 'garden', 'easter', 'light', 'pastel']
          .some(s => lowerStyle.includes(s))) {
        this.logger.debug(`Spring style detected: ${style}`);
        seasonsSet.add(Season.SPRING);
      }
    }
  }
}
