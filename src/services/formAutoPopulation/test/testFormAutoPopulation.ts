import { ItemCategory, Season } from '../../../types';
import { FormField, FormFieldSetter } from '../types';
import { FormAutoPopulationService } from '../FormAutoPopulationService';

/**
 * Simple test utility for the FormAutoPopulationService
 * Run this file with ts-node to verify the refactored service works as expected
 */

// Sample detected tags from AI analysis
const sampleTags = {
  category: 'dress',
  color: 'blue',
  pattern: 'floral',
  material: 'cotton',
  style: 'casual summer',
  brand: 'h&m',
  size: 'medium',
  length: 'midi',
  sleeves: 'short sleeve',
  season: 'summer spring',
  description: 'A beautiful blue floral cotton dress perfect for summer days.'
};

// Create a mock form field setter function
const mockFormState: Record<string, any> = {};
const setField: FormFieldSetter = (field, valueOrUpdater) => {
  const currentValue = mockFormState[field];
  
  if (typeof valueOrUpdater === 'function') {
    mockFormState[field] = valueOrUpdater(currentValue);
  } else {
    mockFormState[field] = valueOrUpdater;
  }
  
  return mockFormState[field];
};

// Function to log the current state of all fields
function logFormState() {
  console.log('\nCURRENT FORM STATE:');
  console.log('==================')
  Object.entries(mockFormState)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([field, value]) => {
      const displayValue = Array.isArray(value) ? `[${value.join(', ')}]` : value;
      console.log(`${field}: ${displayValue}`);
    });
  console.log('==================');
}

// Main test function
function runTest() {
  console.log('Running FormAutoPopulationService test...');
  
  // Create service with logging enabled
  const service = new FormAutoPopulationService(true);
  
  console.log('\n1. Testing with empty form and overwriteExisting=true');
  service.autoPopulateFields(sampleTags, setField, { overwriteExisting: true });
  logFormState();
  
  // Reset form state
  Object.keys(mockFormState).forEach(key => delete mockFormState[key]);
  
  console.log('\n2. Testing with some existing values and overwriteExisting=false');
  // Set some existing values
  setField(FormField.CATEGORY, ItemCategory.ONE_PIECE);
  setField(FormField.COLOR, 'Red'); // This shouldn't be overwritten
  service.autoPopulateFields(sampleTags, setField, { overwriteExisting: false });
  logFormState();
  
  // Reset form state
  Object.keys(mockFormState).forEach(key => delete mockFormState[key]);
  
  console.log('\n3. Testing with skipFields option');
  service.autoPopulateFields(sampleTags, setField, {
    overwriteExisting: true,
    skipFields: [FormField.COLOR, FormField.PATTERN]
  });
  logFormState();
  
  console.log('\n4. Testing with footwear-specific tags');
  const footwearTags = {
    category: 'shoes',
    subcategory: 'boots',
    color: 'black',
    material: 'leather',
    brand: 'dr. martens',
    heel: 'low',
    boot_height: 'ankle',
    style: 'combat',
    description: 'Black leather combat boots with lace-up front'
  };
  
  // Reset form state
  Object.keys(mockFormState).forEach(key => delete mockFormState[key]);
  
  service.autoPopulateFields(footwearTags, setField, { overwriteExisting: true });
  logFormState();
  
  console.log('\nTest completed!');
}

// Run the test
runTest();
