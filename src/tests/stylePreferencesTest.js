// Simple test script for stylePreferencesService
const { getStylePreferences, saveStylePreferences } = require('../services/stylePreferencesService');

/**
 * Test function to verify the stylePreferencesService
 */
async function testStylePreferencesService() {
  console.log('=== STYLE PREFERENCES SERVICE TEST ===');
  
  // Test user ID - use a real UUID from your database for testing
  const testUserId = '123e4567-e89b-12d3-a456-426614174000';
  
  console.log('1. Testing getStylePreferences...');
  try {
    const existingData = await getStylePreferences(testUserId);
    console.log('Existing data result:', existingData);
    
    if (existingData) {
      console.log('✅ Successfully retrieved existing style preferences');
    } else {
      console.log('ℹ️ No existing style preferences found, will create new data');
    }
  } catch (error) {
    console.error('❌ Error getting style preferences:', error);
  }
  
  console.log('\n2. Testing saveStylePreferences...');
  
  // Create test data
  const testData = {
    preferredStyles: ['casual', 'minimalist'],
    stylePreferences: {
      comfortVsStyle: 65,
      classicVsTrendy: 40,
      basicsVsStatements: 75,
      additionalNotes: 'Test notes from stylePreferencesService test'
    }
  };
  
  console.log('Test data to save:', testData);
  
  try {
    const saveResult = await saveStylePreferences(testData, testUserId);
    console.log('Save result:', saveResult);
    
    if (saveResult.success) {
      console.log('✅ Successfully saved test style preferences');
    } else {
      console.error('❌ Failed to save test style preferences:', saveResult.error);
    }
  } catch (error) {
    console.error('❌ Error saving style preferences:', error);
  }
  
  console.log('\n3. Verifying saved data...');
  try {
    const verifyData = await getStylePreferences(testUserId);
    console.log('Verification data result:', verifyData);
    
    if (verifyData) {
      console.log('✅ Successfully retrieved saved style preferences');
      
      // Verify the data matches what we saved
      const stylePrefs = testData.stylePreferences;
      const verifyPrefs = verifyData.stylePreferences || {};
      
      const preferredStylesMatch = JSON.stringify(verifyData.preferredStyles) === 
                                  JSON.stringify(testData.preferredStyles);
      
      const comfortMatch = verifyPrefs.comfortVsStyle === stylePrefs.comfortVsStyle;
      const classicMatch = verifyPrefs.classicVsTrendy === stylePrefs.classicVsTrendy;
      const basicsMatch = verifyPrefs.basicsVsStatements === stylePrefs.basicsVsStatements;
      const notesMatch = verifyPrefs.additionalNotes === stylePrefs.additionalNotes;
      
      console.log('Data verification results:');
      console.log('- preferredStyles match:', preferredStylesMatch);
      console.log('- comfortVsStyle match:', comfortMatch);
      console.log('- classicVsTrendy match:', classicMatch);
      console.log('- basicsVsStatements match:', basicsMatch);
      console.log('- additionalNotes match:', notesMatch);
      
      if (preferredStylesMatch && comfortMatch && classicMatch && basicsMatch && notesMatch) {
        console.log('✅ All data verified correctly!');
      } else {
        console.log('⚠️ Some data fields do not match what was saved');
      }
    } else {
      console.error('❌ Failed to retrieve saved style preferences for verification');
    }
  } catch (error) {
    console.error('❌ Error verifying saved style preferences:', error);
  }
  
  console.log('=== TEST COMPLETE ===');
}

// Run the test
testStylePreferencesService().catch(console.error);
