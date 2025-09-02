# Outfits Service Module

This directory contains the modularized outfit service functionality for the wardrobe app.

## Module Structure

The outfit services have been refactored into logical, focused modules:

### 1. Base Service (`outfitBaseService.ts`)

- Constants (table names, API URL)
- Common utility functions (getAuthHeaders, apiRequest)
- Data conversion helpers (convertToOutfit)
- Error handling (handleError)
- Authentication helpers (getCurrentUserId)

### 2. CRUD Service (`outfitCrudService.ts`)

- Core CRUD operations (fetch, create, update, delete)
- Both Supabase operations and legacy API fallback functions

### 3. Query Service (`outfitQueryService.ts`)

- Specialized query operations (by season, scenario, item)
- Favorite outfit querying
- Table existence checking

### 4. Migration Service (`outfitMigrationService.ts`)

- Migration utilities from legacy API to Supabase
- Migration status checking

### 5. Relations Service (`outfitRelationsService.ts`)

- Join table operations for outfit items and scenarios
- Adding/removing items and scenarios from outfits

### 6. Barrel File (`index.ts`)

- Re-exports all functionality from modular service files
- Maintains backward compatibility through legacy namespace exports

## Legacy Services

Some legacy service files are maintained for backward compatibility:

- `outfitItemService.ts` - Will be consolidated in future refactoring
- `outfitsService.ts` - Legacy implementation with overlapping functionality

## Usage

```typescript
// Import specific functionality
import { fetchOutfits, createOutfit } from '../services/wardrobe/outfits';

// Or use the namespace for backward compatibility
import { outfitService } from '../services/wardrobe/outfits';
```

## Future Improvements

- Consolidate `outfitItemService.ts` into `outfitRelationsService.ts`
- Migrate all code to use the new modular imports
- Add comprehensive unit tests for each module
