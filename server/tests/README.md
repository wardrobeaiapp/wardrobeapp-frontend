# Server Unit Tests

This directory contains unit tests for critical AI analysis functions to ensure our scenario coverage logic doesn't break with future changes.

## Running Tests

### Install Jest (if not already installed)
```bash
cd server
npm install
```

### Run all tests
```bash
npm test
```

### Run tests in watch mode (re-runs on file changes)
```bash
npm run test:watch
```

### Run tests with coverage report
```bash
npm run test:coverage
```

## Test Coverage

### `generateObjectiveFinalReason.test.js`
Tests the core logic for generating AI analysis reasons:
- ✅ **Subcategory handling** - Uses specific subcategory (bags) instead of generic category (accessory)
- ✅ **Non-seasonal accessory logic** - Bags, jewelry, etc. don't include season info
- ✅ **Seasonal accessory logic** - Scarfs, hats include season info when appropriate  
- ✅ **Scenario filtering** - Only includes scenarios for scenario-specific coverage (not "All scenarios")
- ✅ **Gap type responses** - Different messages for critical, improvement, expansion, satisfied, oversaturated
- ✅ **Constraint goals** - Modified recommendations for users with saving/decluttering goals
- ✅ **Edge cases** - Empty data, missing formData, malformed coverage

### `extractSuitableScenarios.test.js`  
Tests Claude response parsing for scenario suitability:
- ✅ **Format parsing** - Numbered lists, bullets, dashes, plain text
- ✅ **Negative filtering** - Excludes scenarios marked as "not suitable", "inappropriate", etc.
- ✅ **Text cleaning** - Removes explanations in parentheses, after colons/dashes
- ✅ **Robustness** - Handles missing sections, malformed responses, case variations
- ✅ **Footwear examples** - Real-world scenarios like heels not being suitable for outdoor activities

## Key Test Cases

### Real-world scenarios that were fixed:
```javascript
// Bags should have no season or scenario info
expect(result).toBe('Your bags collection could use some variety. This would be a nice addition!');

// Outerwear should have season but no scenarios  
expect(result).toContain('plenty of jackets for spring/fall');
expect(result).not.toContain('Office Work');

// Regular items should have both season and scenarios
expect(result).toContain('dress shirts collection could use some variety for summer, especially for Office Work and Social Outings');

// Heels should not be suggested for outdoor activities
expect(result).not.toContain('Light Outdoor Activities');
```

These tests ensure our carefully crafted logic remains intact as the codebase evolves.
