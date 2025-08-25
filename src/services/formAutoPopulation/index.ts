// Main service
export { FormAutoPopulationService } from './FormAutoPopulationService';

// Types
export type { DetectedTags, AutoPopulationOptions, FormFieldSetter } from './types';

// Utilities
export { Logger } from './utils/logger';
export { ExtractionHelpers } from './utils/extractionHelpers';

// Mapping exports
export { getCategoryFromKeyword, formatCategoryName } from './mappings/categoryMappings';
export { getSubcategoriesForCategory } from './mappings/subcategoryMappings';
export { getColorOptions } from './mappings/colorMappings';
export { getPatternOptions } from './mappings/patternMappings';
export { getAllSeasons } from './mappings/seasonMappings';

// Individual extractors for direct use if needed
export { CategoryExtractor } from './extractors/categoryExtractor';
export { ColorExtractor } from './extractors/colorExtractor';
export { PatternExtractor } from './extractors/patternExtractor';
export { MaterialExtractor } from './extractors/materialExtractor';
export { BrandExtractor } from './extractors/brandExtractor';
export { SizeExtractor } from './extractors/sizeExtractor';
export { SeasonExtractor } from './extractors/seasonExtractor';
export { StyleExtractor } from './extractors/styleExtractor';
export { FootwearExtractor } from './extractors/footwearExtractor';
export { NameGenerator } from './extractors/nameGenerator';
