// Script to fix onboarding_completed flag in the user_profiles table
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Create Supabase client
const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_KEY
);

async function fixOnboardingFlag() {
  try {
    // Get current authenticated user
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError || !authData.session) {
      console.error('Not authenticated. Please login first.');
      return;
    }
    
    const userId = authData.session.user.id;
    console.log(`Current user ID: ${userId}`);
    
    // Find user profile
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
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
    
    const profile = profileData[0];
    console.log(`Current onboarding status: ${profile.onboarding_completed}`);
    
    // Update onboarding flag to true
    const { data: updateData, error: updateError } = await supabase
      .from('user_profiles')
      .update({ onboarding_completed: true })
      .eq('id', profile.id);
    
    if (updateError) {
      console.error('Error updating profile:', updateError.message);
      return;
    }
    
    console.log('Successfully updated onboarding_completed to true');
    console.log('Please refresh your app to see the changes');
  } catch (error) {
    console.error('Unexpected error:', error.message);
  }
}

fixOnboardingFlag();
