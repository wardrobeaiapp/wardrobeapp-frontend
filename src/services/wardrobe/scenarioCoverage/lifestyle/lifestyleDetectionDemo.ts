import { detectLifestyleType, analyzeAndLogLifestyle, getOuterwearTargets, getLifestyleTargets } from './lifestyleDetectionService';
import { Scenario } from '../../../scenarios/types';

/**
 * Demo scenarios for different lifestyle types to test the detection system
 */

// Indoor-focused person (work from home, stay home lifestyle)
const indoorFocusedScenarios: Scenario[] = [
  {
    id: '1',
    user_id: 'test',
    name: 'Staying at Home',
    frequency: '7 times per week',
    description: 'Working from home and relaxing',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2', 
    user_id: 'test',
    name: 'Remote Work',
    frequency: '5 times per week',
    description: 'Working from home office',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    user_id: 'test', 
    name: 'Social Outings',
    frequency: '1 times per month',
    description: 'Occasional dinner with friends',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Outdoor-focused person (office work, travel, activities)
const outdoorFocusedScenarios: Scenario[] = [
  {
    id: '1',
    user_id: 'test',
    name: 'Office Work',
    frequency: '5 times per week',
    description: 'Daily commute to office',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    user_id: 'test',
    name: 'Light Outdoor Activities', 
    frequency: '4 times per week',
    description: 'Regular walks and outdoor activities',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    user_id: 'test',
    name: 'Social Outings',
    frequency: '3 times per week', 
    description: 'Regular social activities',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '4',
    user_id: 'test',
    name: 'Travel',
    frequency: '2 times per month',
    description: 'Business and leisure travel',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Balanced lifestyle person
const balancedScenarios: Scenario[] = [
  {
    id: '1',
    user_id: 'test',
    name: 'Office Work',
    frequency: '3 times per week',
    description: 'Hybrid work schedule',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    user_id: 'test',
    name: 'Remote Work',
    frequency: '2 times per week',
    description: 'Work from home days',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    user_id: 'test',
    name: 'Light Outdoor Activities',
    frequency: '2 times per week',
    description: 'Weekend outdoor activities',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '4',
    user_id: 'test',
    name: 'Social Outings',
    frequency: '2 times per week',
    description: 'Regular social life',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

/**
 * Demo function to test lifestyle detection with different user profiles
 */
export function runLifestyleDetectionDemo(): void {
  console.log('\n🏠🏃 LIFESTYLE DETECTION DEMO\n');
  console.log('='.repeat(50));

  console.log('\n👤 INDOOR-FOCUSED PERSON:');
  console.log('Scenarios: Stay home 7x/week, Remote work 5x/week, Social 1x/month');
  const indoorAnalysis = analyzeAndLogLifestyle(indoorFocusedScenarios);
  console.log(`Expected: indoor_focused, Got: ${indoorAnalysis.type}`);
  const indoorOuterwear = getOuterwearTargets('spring/fall', indoorAnalysis.type);  // Use seasonal outerwear
  const indoorBags = getLifestyleTargets('bags', indoorAnalysis.type);
  console.log(`Expected targets - Spring/Fall Outerwear: 2-3, Got: ${indoorOuterwear.min}-${indoorOuterwear.ideal}, Bags: 1-2, Got: ${indoorBags.min}-${indoorBags.ideal}`);

  console.log('\n👤 OUTDOOR-FOCUSED PERSON:');
  console.log('Scenarios: Office 5x/week, Outdoor activities 4x/week, Social 3x/week, Travel 2x/month');
  const outdoorAnalysis = analyzeAndLogLifestyle(outdoorFocusedScenarios);
  console.log(`Expected: outdoor_focused, Got: ${outdoorAnalysis.type}`);
  const outdoorOuterwear = getOuterwearTargets('spring/fall', outdoorAnalysis.type);  // Use seasonal outerwear
  const outdoorBags = getLifestyleTargets('bags', outdoorAnalysis.type);
  console.log(`Expected targets - Spring/Fall Outerwear: 3-4, Got: ${outdoorOuterwear.min}-${outdoorOuterwear.ideal}, Bags: 2-4, Got: ${outdoorBags.min}-${outdoorBags.ideal}`);

  console.log('\n👤 MIXED PERSON (no "balanced" type anymore):');
  console.log('This will now be classified as either indoor or outdoor based on primary activity');

  console.log('\n='.repeat(50));
  console.log('🏠🏃 DEMO COMPLETE - Check console for lifestyle analysis results');
}

// Functions imported above

/**
 * Show expected wardrobe targets for different lifestyles
 */
export function showWardrobeTargetExamples(): void {
  console.log('\n👕 REALISTIC WARDROBE TARGETS (NO MORE MULTIPLIERS!)\n');
  console.log('='.repeat(50));

  // Show examples for different seasons
  const indoorSpringOuterwear = getOuterwearTargets('spring/fall', 'indoor_focused');
  const outdoorSpringOuterwear = getOuterwearTargets('spring/fall', 'outdoor_focused');
  const indoorWinterOuterwear = getOuterwearTargets('winter', 'indoor_focused');
  const outdoorWinterOuterwear = getOuterwearTargets('winter', 'outdoor_focused');
  
  const indoorBags = getLifestyleTargets('bags', 'indoor_focused');
  const outdoorBags = getLifestyleTargets('bags', 'outdoor_focused');
  
  const indoorFootwear = getLifestyleTargets('footwear', 'indoor_focused');
  const outdoorFootwear = getLifestyleTargets('footwear', 'outdoor_focused');

  console.log('\n🧥 SEASONAL OUTERWEAR TARGETS (realistic numbers by season):');
  console.log(`• Indoor Spring/Fall: ${indoorSpringOuterwear.min}/${indoorSpringOuterwear.ideal}/${indoorSpringOuterwear.max} (reduced from base seasonal targets)`);
  console.log(`• Outdoor Spring/Fall: ${outdoorSpringOuterwear.min}/${outdoorSpringOuterwear.ideal}/${outdoorSpringOuterwear.max} (full seasonal variety)`);
  console.log(`• Indoor Winter: ${indoorWinterOuterwear.min}/${indoorWinterOuterwear.ideal}/${indoorWinterOuterwear.max} (fewer pieces, rarely go out)`);
  console.log(`• Outdoor Winter: ${outdoorWinterOuterwear.min}/${outdoorWinterOuterwear.ideal}/${outdoorWinterOuterwear.max} (need full winter wardrobe)`);

  console.log('\n👜 BAG TARGETS (FIXED - no more "1 bag ideal" nonsense!):');
  console.log(`• Indoor-focused: ${indoorBags.min}/${indoorBags.ideal}/${indoorBags.max} (basic bag + maybe one more)`);
  console.log(`• Outdoor-focused: ${outdoorBags.min}/${outdoorBags.ideal}/${outdoorBags.max} (work bag, casual, evening, travel)`);

  console.log('\n👟 FOOTWEAR TARGETS (common sense numbers):');
  console.log(`• Indoor-focused: ${indoorFootwear.min}/${indoorFootwear.ideal}/${indoorFootwear.max} (casual shoes, maybe one dress pair)`);
  console.log(`• Outdoor-focused: ${outdoorFootwear.min}/${outdoorFootwear.ideal}/${outdoorFootwear.max} (work, casual, weather, activity shoes)`);

  console.log('\n💡 KEY IMPROVEMENTS:');
  console.log('✅ No more weird equal min/ideal/max values from multipliers');
  console.log('✅ Realistic progression: min < ideal < max');
  console.log('✅ Common sense numbers based on actual lifestyle needs');
  console.log('✅ Binary detection: office work = outdoor, remote work = indoor');
}
