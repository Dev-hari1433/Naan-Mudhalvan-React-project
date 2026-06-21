import { runTestsSuite } from './finance.test.js';

console.log('====================================================');
console.log('RUNNING SYSTEM CALCULATION TESTS SUITE...');
console.log('====================================================\n');

const suiteResults = runTestsSuite();
let failedAny = false;

suiteResults.forEach((test, idx) => {
  if (test.passed) {
    console.log(`✓ [PASS] [Test #${idx + 1}] - ${test.name}`);
  } else {
    console.log(`✗ [FAIL] [Test #${idx + 1}] - ${test.name}`);
    console.log(`    Error Details: ${test.error}`);
    failedAny = true;
  }
});

console.log('\n====================================================');
if (failedAny) {
  console.log('TEST RUN COMPLETED WITH FAILURES.');
  console.log('====================================================');
  process.exit(1);
} else {
  console.log('ALL TESTS COMPLETED SUCCESSFULLY. STATUS: OK');
  console.log('====================================================');
  process.exit(0);
}
