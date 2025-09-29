#!/usr/bin/env node

/**
 * Wardrobe Item Field Testing Script
 * 
 * This script runs comprehensive tests to ensure all wardrobe item fields
 * are properly saved and persisted. It will catch field regression issues
 * before they reach production.
 * 
 * Usage:
 *   node package-scripts/test-fields.js
 *   npm run test:fields
 */

const { spawn } = require('child_process');
const path = require('path');

const testFiles = [
  // Backend API tests
  'server/tests/integration/wardrobeItems.allFields.test.js',
  'server/tests/integration/wardrobeItems.fullWorkflow.test.js',
  'server/tests/utils/wardrobeItemValidation.test.js',
  
  // Frontend form tests
  'src/__tests__/components/WardrobeItemForm.allFields.test.tsx'
];

async function runTest(testFile) {
  return new Promise((resolve, reject) => {
    console.log(`\n🧪 Running: ${testFile}`);
    console.log('='.repeat(60));

    const isBackendTest = testFile.startsWith('server/');
    const command = isBackendTest ? 'npm' : 'npm';
    const args = isBackendTest 
      ? ['test', testFile, '--', '--verbose'] 
      : ['test', testFile, '--', '--verbose'];

    const child = spawn(command, args, {
      stdio: 'inherit',
      cwd: path.resolve(__dirname, '..')
    });

    child.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ ${testFile} PASSED\n`);
        resolve(true);
      } else {
        console.log(`❌ ${testFile} FAILED\n`);
        resolve(false);
      }
    });

    child.on('error', (error) => {
      console.error(`Error running ${testFile}:`, error);
      reject(error);
    });
  });
}

async function main() {
  console.log('🔍 WARDROBE ITEM FIELD REGRESSION TESTING');
  console.log('This will verify that ALL wardrobe item fields are properly saved and updated.');
  console.log('='.repeat(80));

  const results = [];
  
  for (const testFile of testFiles) {
    try {
      const passed = await runTest(testFile);
      results.push({ testFile, passed });
    } catch (error) {
      console.error(`Failed to run test ${testFile}:`, error);
      results.push({ testFile, passed: false, error });
    }
  }

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('='.repeat(80));

  const passed = results.filter(r => r.passed).length;
  const total = results.length;

  results.forEach(({ testFile, passed, error }) => {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${testFile}`);
    if (error) {
      console.log(`    Error: ${error.message}`);
    }
  });

  console.log(`\n📈 Results: ${passed}/${total} tests passed`);

  if (passed === total) {
    console.log('🎉 ALL FIELD TESTS PASSED! Your wardrobe item fields are properly preserved.');
  } else {
    console.log('⚠️  SOME TESTS FAILED! Check the output above for field regression issues.');
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('Test runner error:', error);
    process.exit(1);
  });
}

module.exports = { runTest, main };
