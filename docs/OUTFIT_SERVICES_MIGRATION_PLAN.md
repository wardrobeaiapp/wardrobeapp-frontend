# Outfit Services Migration Plan

## Overview

This document outlines the plan for migrating from the monolithic `outfitService.ts` file to the new modular outfit service architecture. The migration is being done to improve maintainability, readability, and scalability of the codebase.

## Current Status

- All core functionality has been refactored into modular service files
- The original `outfitService.ts` file has been marked as deprecated
- Runtime logging has been added to track usage of deprecated functions
- All new development should use the modular services

## New Architecture

### Modular Service Files

- **outfitBaseService.ts** - Common utilities and constants
- **outfitCrudService.ts** - Core CRUD operations
- **outfitQueryService.ts** - Specialized queries
- **outfitMigrationService.ts** - Migration utilities
- **outfitRelationsService.ts** - Join table operations

### Barrel File

The `outfits/index.ts` barrel file exports all functionality and maintains backward compatibility with legacy code.

## Migration Timeline

1. **Phase 1: Deprecation (Current)** 
   - ✅ Add deprecation notices
   - ✅ Add runtime console warnings
   - ✅ Create documentation

2. **Phase 2: Monitoring (2-4 weeks)**
   - Monitor console logs for usage of deprecated functions
   - Identify parts of the application still using old services
   - Assist teams in migrating to new services

3. **Phase 3: Migration (1-2 months)**
   - Update all imports to use the barrel file
   - Replace direct calls to deprecated functions
   - Update tests to use new modular services

4. **Phase 4: Removal (After Q4 2025)**
   - Once no usage is detected, schedule removal of `outfitService.ts`
   - Update barrel file to remove deprecated exports
   - Final verification that no code breaks

## Migration Guidelines for Developers

### How to Migrate Your Code

1. **Update imports**:
   ```typescript
   // OLD
   import { fetchOutfits } from '../services/wardrobe/outfits/outfitService';
   
   // NEW
   import { fetchOutfits } from '../services/wardrobe/outfits';
   ```

2. **Use the modular equivalents**:
   - Use `outfitCrudService.ts` functions for CRUD operations
   - Use `outfitQueryService.ts` for specialized queries
   - Use `outfitRelationsService.ts` for managing outfit relationships

3. **Testing Changes**:
   - Update test imports to use barrel file
   - Verify functionality matches expectations
   - Run complete test suite before committing

## Support and Questions

For questions about the migration or assistance with updating your code, please contact the Wardrobe App Core Team.
