const { createClient } = require('@supabase/supabase-js');

/**
 * Centralized Supabase configuration for server-side operations
 */
class SupabaseConfig {
  constructor() {
    this.supabaseUrl = process.env.SUPABASE_URL || 'https://gujpqecwdftbwkcnwiup.supabase.co';
    this.supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    this.supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1anBxZWN3ZGZ0YndrY253aXVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MTU0NDksImV4cCI6MjA2ODA5MTQ0OX0.1_ViFuaH4PAiTk_QkSm7S9srp1rQa_Zv7D2a8pJx5So';
    
    this.client = null;
    this.configured = false;
    
    this.initialize();
  }

  /**
   * Initialize Supabase client with appropriate key
   * @param {boolean} useServiceRole - Whether to use service role key (bypasses RLS)
   */
  initialize(useServiceRole = true) {
    try {
      const key = useServiceRole && this.supabaseServiceKey 
        ? this.supabaseServiceKey 
        : this.supabaseAnonKey;

      if (!this.supabaseUrl || !key) {
        console.error('Missing Supabase configuration');
        this.configured = false;
        return null;
      }

      this.client = createClient(this.supabaseUrl, key);
      this.configured = true;

      console.log(`🔑 Supabase client initialized using: ${
        useServiceRole && this.supabaseServiceKey 
          ? 'SERVICE_ROLE_KEY (can bypass RLS)' 
          : 'ANON_KEY (RLS applied)'
      }`);

      return this.client;
    } catch (error) {
      console.error('Failed to initialize Supabase client:', error);
      this.configured = false;
      return null;
    }
  }

  /**
   * Get Supabase client instance
   */
  getClient() {
    if (!this.configured) {
      return this.initialize();
    }
    return this.client;
  }

  /**
   * Check if Supabase is properly configured
   */
  isConfigured() {
    return this.configured;
  }
}

// Export singleton instance
module.exports = new SupabaseConfig();
