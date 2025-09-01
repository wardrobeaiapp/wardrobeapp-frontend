# Profile Services Migration Plan

## Overview

This document outlines the plan for completing the migration of profile-related service files to the centralized `services/profile/` directory and eventually removing the deprecated service files from the codebase.

## Current Status

### Completed Steps

- ✅ Created new service files in the `services/profile/` directory
- ✅ Added deprecation notices to old service files
- ✅ Updated all imports in the codebase to use the new service paths

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

### Phase 2: Removal (Next Sprint)

1. **Create a dedicated PR for removing deprecated files**
   - Remove `services/userPreferencesService.ts`
   - Remove `services/sectionPreferencesService.ts`
   - Remove `services/supabasePreferencesService.ts`

2. **Verify no regressions after removal**
   - Full test suite must pass
   - Manual testing of all profile sections
   - Verify build succeeds with no errors

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

- **Deprecation Phase**: Completed (Current Sprint)
- **Verification Phase**: Current Sprint
- **Removal Phase**: Next Sprint (target date: TBD)
