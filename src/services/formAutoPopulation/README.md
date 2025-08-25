# Form Auto Population Service

This module provides a comprehensive service for automatically populating form fields based on AI-detected tags. It extracts information about clothing items (such as category, color, pattern, etc.) and populates the form fields accordingly.

## Architecture

The service has been refactored into a modular structure with the following components:

```
formAutoPopulation/
├── extractors/           # Specialized field extraction classes
├── mappings/             # Static mapping dictionaries
├── types/                # TypeScript interfaces and types
├── utils/                # Reusable helper functions
├── test/                 # Test utilities
├── FormAutoPopulationService.ts  # Main service class
└── index.ts              # Exports all components
```

## Usage

```typescript
import { FormAutoPopulationService } from '@/services/formAutoPopulation';
import { FormField } from '@/types/wardrobeItems';

// Create an instance of the service
const autoPopulationService = new FormAutoPopulationService();

// Enable/disable logging as needed
autoPopulationService.setLoggingEnabled(process.env.NODE_ENV === 'development');

// Use the service to auto-populate form fields
autoPopulationService.autoPopulateFields(
  detectedTags,  // AI-detected tags
  setField,       // Callback function to set field values
  {               // Options
    overwriteExisting: false,  // Don't overwrite existing values
    skipFields: [FormField.BRAND], // Skip certain fields
  }
);
```

## Components

### Main Service

- `FormAutoPopulationService` - Orchestrates the extraction and population of form fields

### Extractors

- `CategoryExtractor` - Extracts category and subcategory information
- `ColorExtractor` - Extracts color information
- `PatternExtractor` - Extracts pattern information
- `MaterialExtractor` - Extracts material information
- `BrandExtractor` - Extracts brand information
- `SizeExtractor` - Extracts size information based on category
- `SeasonExtractor` - Extracts seasonal information
- `StyleExtractor` - Extracts style, silhouette, length, sleeves, and rise information
- `FootwearExtractor` - Extracts footwear-specific information (heel height, boot height, type)
- `NameGenerator` - Generates a name for the item based on its attributes

### Utilities

- `Logger` - Configurable logging utility
- `ExtractionHelpers` - Generic helper functions for extraction tasks

### Mappings

- `categoryMappings` - Maps keywords to categories
- `subcategoryMappings` - Maps categories to subcategories
- `colorMappings` - Maps color keywords to standard colors
- `patternMappings` - Maps pattern keywords to standard patterns
- `seasonMappings` - Maps season keywords to seasons

## Testing

A simple test utility is included in the `test` directory:

```
npx ts-node src/services/formAutoPopulation/test/testFormAutoPopulation.ts
```

## Benefits of the Refactored Architecture

1. **Modularity** - Each component has a single responsibility
2. **Maintainability** - Easier to modify and extend
3. **Readability** - Clean, well-organized code
4. **Reusability** - Components can be used independently
5. **Configurability** - Logging can be enabled/disabled as needed
6. **Testability** - Components can be tested in isolation
7. **Reduced redundancy** - Common patterns extracted into helper functions
