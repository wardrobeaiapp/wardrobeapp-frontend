// Quick test to check if frequency-based coverage is working
// Run this in the browser console or as a Node.js script

// Test data - replace with actual user data
const testUserId = 'your-user-id';
const testSeason = 'fall';

const testItems = [
  {
    id: '1',
    name: 'Blue Dress Shirt',
    category: 'top',
    season: ['fall'],
    scenarios: ['work-scenario-id']
  },
  {
    id: '2',
    name: 'Black Trousers',
    category: 'bottom', 
    season: ['fall'],
    scenarios: ['work-scenario-id']
  },
  {
    id: '3',
    name: 'Navy Dress',
    category: 'one_piece',
    season: ['fall'],
    scenarios: ['work-scenario-id']
  }
];

const testScenarios = [
  {
    id: 'work-scenario-id',
    name: 'Work Meetings',
    frequency: '3 times per week'
  },
  {
    id: 'casual-scenario-id', 
    name: 'Weekend Errands',
    frequency: 'twice per week'
  }
];

// Test the frequency calculator directly
async function testFrequencySystem() {
  try {
    console.log('🧪 Testing frequency-based coverage system...');
    
    // Import the service
    const { ScenarioCoverageService } = await import('./src/services/wardrobe/scenarioCoverage/index.js');
    
    const service = ScenarioCoverageService.getInstance();
    
    // Test the new frequency-based system
    await service.updateScenarioCoverage(
      testUserId,
      testItems,
      testScenarios,
      testSeason
    );
    
    console.log('✅ Frequency-based coverage test completed! Check your database.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// To run the test, call:
// testFrequencySystem();

console.log('🚀 Test script loaded. Replace testUserId with your actual user ID and run testFrequencySystem()');
