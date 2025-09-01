/**
 * IMPORTANT: This file is a temporary migration helper to consolidate Supabase client usage.
 * 
 * The app currently has two separate Supabase client files:
 * 1. supabase.ts
 * 2. supabaseClient.ts
 * 
 * This is causing "Multiple GoTrueClient instances" warnings and performance issues.
 * 
 * To fix this:
 * 1. Import from this file instead of directly from either supabase.ts or supabaseClient.ts
 * 2. Once all imports are migrated, we can remove the duplicate client file
 */

import { supabase } from './core';

// Re-export the singleton client
export { supabase };

// For debugging - log when this file is imported
console.log('Using consolidated Supabase client from supabaseClientMigration.ts');
