import { execSync } from 'child_process';

console.log('================================================');
console.log('🤖 HORIZON QA AGENT: Initializing Diagnostics...');
console.log('================================================\n');

try {
  console.log('[1/2] Running TypeScript Compiler Checks...');
  execSync('npx tsc --noEmit', { stdio: 'inherit' });
  console.log('✅ TypeScript Compiler: PASSED\n');

  console.log('[2/2] Running Vitest Suites & Generating Coverage...');
  execSync('npx vitest run --coverage', { stdio: 'inherit' });
  console.log('✅ Automated Test Suites: PASSED\n');

  console.log('================================================');
  console.log('🟢 QA HEALTH REPORT: ALL SYSTEMS NOMINAL');
  console.log('================================================');
  console.log('The Horizon Application is stable. Blast radius is contained.');
  process.exit(0);

} catch (error) {
  console.error('\n================================================');
  console.error('🔴 QA HEALTH REPORT: CRITICAL FAILURE DETECTED');
  console.error('================================================');
  console.error('The QA Agent has caught a regression or syntax error.');
  console.error('Review the logs above for the exact blast radius.');
  
  // Subagent Fix: Ensure exit code bubbles up to prevent false-positives
  process.exit(1);
}
