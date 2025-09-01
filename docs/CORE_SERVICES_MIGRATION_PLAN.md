# Core Services Migration Plan

## Overview

This document outlines the plan for migrating application services to the centralized `services/core/` directory and eventually removing the deprecated service files from the codebase.

## Current Status

### Completed Steps

- ✅ Created new service files in the `services/core/` directory
- ✅ Added deprecation notices to all deprecated service files
- ✅ Updated all imports to use the `services/core` directory
- ✅ Removed all deprecated service files
- ✅ Successfully built application with no errors

### Files Being Migrated

| Old File Path | New File Path |
|--------------|---------------|
| `services/imageProxyService.ts` | `services/core/imageProxyService.ts` |
| `services/supabase.ts` | `services/core/supabase.ts` |
| `services/supabaseClient.ts` | `services/core/supabaseClient.ts` |

## Removal Plan

### Phase 1: Deprecation (Completed)

1. **Add Deprecation Notices**
   - ✅ Added to `services/imageProxyService.ts`
   - ✅ Added to `services/supabase.ts`
   - ✅ Added to `services/supabaseClient.ts`

2. **Update Import Paths**
   - ✅ Updated for `imageProxyService.ts`
   - ✅ Updated for `supabase.ts`
   - ✅ Updated for `supabaseClient.ts`

### Phase 2: Verification (Completed)

1. **Comprehensive Testing**
   - ✅ Ensured all functionality works with the new service paths
   - ✅ Verified that all imports are using the new paths
   - ✅ Run build verification to confirm functionality

2. **Build Verification**
   - ✅ Confirmed successful TypeScript compilation with no errors
   - ✅ Validated application builds successfully

### Phase 3: Removal (Completed)

1. **Removed deprecated files**
   - ✅ Removed `services/imageProxyService.ts`
   - ✅ Removed `services/supabase.ts`
   - ✅ Removed `services/supabaseClient.ts`

2. **Verified no regressions after removal**
   - ✅ Successfully updated all imports to use services/core
   - ✅ Fixed dynamic imports in api.ts to use core
   - ✅ Verified build succeeds with no errors

## Architecture Note

The migration follows these architectural principles:

1. **Centralized Core Services**
   - Critical infrastructure services reside in `services/core/`
   - Consistent singleton pattern for Supabase clients
   - Proper re-exports through index.ts for simplified imports

2. **Import Pattern**
   - New imports should use `import { ... } from '../services/core'`
   - This leverages the re-exports from the core index.ts file

3. **Supabase Client Consolidation**
   - Resolves "Multiple GoTrueClient instances" warnings
   - Improves application performance
   - Ensures consistent authentication state

## Post-Migration Improvements

- Consider consolidating related services if there's redundancy
- Add comprehensive unit tests for the core services
- Document the new service architecture in the developer documentation
- Create guidelines for future service development to follow this pattern

## Timeline

- **Deprecation Phase**: Completed (September 2025)
- **Verification Phase**: Completed (September 2025)
- **Removal Phase**: Completed (September 2025)
