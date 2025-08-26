/**
 * IMPORTANT: This file is now just a re-export of supabase.ts
 * This change was made to fix multiple GoTrueClient instances
 * in the same browser context
 */

// Re-export everything from the main supabase.ts file
export * from './supabase';

// This ensures all imports from either supabase.ts or supabaseClient.ts
// will use the same singleton instance
