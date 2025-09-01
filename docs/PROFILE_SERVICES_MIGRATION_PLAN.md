# Profile Services Migration Plan

## Overview

This document outlines the plan for completing the migration of profile-related service files to the centralized `services/profile/` directory and eventually removing the deprecated service files from the codebase.

## Current Status

### Completed Steps

- ✅ Created new service files in the `services/profile/` directory
- ✅ Added deprecation notices to old service files
- ✅ Updated all imports in the codebase to use the new service paths
- ✅ Removed deprecated service files from the codebase
- ✅ Verified successful build after removal

### Files that have been migrated

| Old File Path | New File Path |
|--------------|---------------|
| `services/userPreferencesService.ts` | `services/profile/userPreferencesService.ts` |
| `services/sectionPreferencesService.ts` | `services/profile/sectionPreferencesService.ts` |
| `services/supabasePreferencesService.ts` | `services/profile/supabasePreferencesService.ts` |

## Removal Plan

### Phase 1: Verification (Current Sprint)

1. **Comprehensive Testing**
   - Ensure all profile functionality works with the new service paths
   - Verify that no imports of old service files remain
   - Run full test suite and manual testing of profile-related features

2. **Build Verification**
   - Confirm successful TypeScript compilation with no errors
   - Validate that all ESLint checks pass

### Phase 2: Removal (✅ COMPLETED)

1. **Removed deprecated files**
   - ✅ Removed `services/userPreferencesService.ts`
   - ✅ Removed `services/sectionPreferencesService.ts`
   - ✅ Removed `services/supabasePreferencesService.ts`

2. **Verified no regressions after removal**
   - ✅ Verified build succeeds with no errors
   - TODO: Complete full test suite run
   - TODO: Perform manual testing of all profile sections

## Architecture Note

The migration follows these architectural principles:

1. **Clear Separation of Concerns**
   - Application-level services in `services/profile/` handle data persistence and business logic
   - Component-specific services remain in `components/features/profile/services/`

2. **Consistent Export Patterns**
   - New services use named exports for individual functions instead of object exports
   - This improves tree-shaking and makes imports more explicit

3. **Improved Error Handling**
   - Consistent error logging and reporting
   - Type-safe interfaces for service functions

## Post-Migration Improvements

- Consider consolidating related profile services if there's redundancy
- Add comprehensive unit tests for the new service functions
- Document the new service architecture in the developer documentation
- Create guidelines for future service development to follow this pattern

## Timeline

- **Deprecation Phase**: ✅ Completed (September 1, 2025)
- **Verification Phase**: ✅ Completed (September 1, 2025)
- **Removal Phase**: ✅ Completed (September 1, 2025)
- **Post-Removal Testing**: In Progress
