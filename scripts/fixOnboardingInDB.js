// Script to fix onboarding_completed flag in the database
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Create a Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase credentials in .env file');
  console.error('Make sure REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_KEY are set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixOnboardingFlag() {
  try {
    console.log('Fixing onboarding_completed flag in the database...');
    
    // Get current session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error:', sessionError.message);
      return;
    }
    
    if (!sessionData.session) {
      console.error('No active session found. Please login first.');
      return;
    }
    
    const userId = sessionData.session.user.id;
    console.log(`Current user ID: ${userId}`);
    
    // Check current status
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, onboarding_completed')
      .eq('user_uuid', userId)
      .order('id', { ascending: false })
      .limit(1);
      
    if (profileError) {
      console.error('Error fetching profile:', profileError.message);
      return;
    }
    
    if (!profileData || profileData.length === 0) {
      console.error('No user profile found');
      return;
    }
    
    console.log(`Current profile ID: ${profileData[0].id}`);
    console.log(`Current onboarding status: ${profileData[0].onboarding_completed}`);
    
    // Update onboarding flag
    const { data: updateData, error: updateError } = await supabase
      .from('user_profiles')
      .update({ onboarding_completed: true })
      .eq('id', profileData[0].id);
      
    if (updateError) {
      console.error('Error updating profile:', updateError.message);
      return;
    }
    
    // Verify the update
    const { data: verifyData, error: verifyError } = await supabase
      .from('user_profiles')
      .select('onboarding_completed')
      .eq('id', profileData[0].id)
      .single();
      
    if (verifyError) {
      console.error('Error verifying update:', verifyError.message);
      return;
    }
    
    console.log(`Updated onboarding status: ${verifyData.onboarding_completed}`);
    console.log('✅ Database update successful!');
    
  } catch (error) {
    console.error('Unexpected error:', error.message);
  }
}

fixOnboardingFlag();
