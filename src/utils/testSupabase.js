// Test utility to check Supabase outfits table
import { supabase } from '../services/core';
import { outfitService } from '../services/wardrobe/outfits';

const OUTFITS_TABLE = 'outfits';

// Function to check outfits in Supabase
export const checkOutfitsInSupabase = async () => {
  try {
    console.log('Checking outfits in Supabase...');
    
    // Get all outfits for the current user
    const { data, error } = await supabase
      .from(OUTFITS_TABLE)
      .select('*');
      
    if (error) {
      console.error('Error fetching outfits from Supabase:', error);
      return;
    }
    
    console.log('Outfits in Supabase:', data);
    console.log('Total outfits found:', data.length);
    
    return data;
  } catch (err) {
    console.error('Exception when checking Supabase outfits:', err);
  }
};

// Check if the outfits table exists in Supabase
export const verifyOutfitsTable = async () => {
  try {
    console.log('Verifying outfits table exists in Supabase...');
    
    // First check if user is authenticated
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      console.error('User not authenticated when checking table:', authError);
      alert('Error: User not authenticated. Please log in first.');
      return false;
    }
    
    console.log('User authenticated:', authData.user.id);
    
    // Try to query the table directly instead of using RPC
    const { data: tableData, error: tableError } = await supabase
      .from('outfits')
      .select('id')
      .limit(1);
      
    if (tableError) {
      console.error('Error checking outfits table:', tableError);
      
      if (tableError.code === '42P01') {
        // Table doesn't exist error
        alert('Error: The outfits table does not exist in Supabase. Please run the SQL script to create it.');
      } else {
        alert(`Error: Could not verify outfits table. ${tableError.message}`);
      }
      return false;
    }
    
    console.log('Table query successful:', tableData);
    
    // Also check using our service function
    const exists = await outfitService.checkOutfitsTableExists();
    
    if (exists) {
      console.log('Outfits table exists and is accessible!');
      alert('Success: Outfits table exists in Supabase!');
      return true;
    } else {
      console.error('Outfits table check failed');
      alert('Error: Outfits table does not exist or is not accessible.');
      return false;
    }
  } catch (err) {
    console.error('Exception when verifying outfits table:', err);
    alert(`Error: ${err.message}`);
    return false;
  }
};

// You can call these functions from the browser console:
// import { checkOutfitsInSupabase, verifyOutfitsTable } from './utils/testSupabase.js';
// checkOutfitsInSupabase().then(data => console.log('Done!'));
// verifyOutfitsTable().then(exists => console.log('Table exists:', exists));
