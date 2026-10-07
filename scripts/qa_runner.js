import { execSync } from 'child_process';

console.log('Horizon Quality Assurance Suite');
console.log('--------------------------------');

try {
  console.log('[1/2] Checking TypeScript compilation...');
  execSync('npx --package=typescript tsc --noEmit', { stdio: 'inherit' });
  console.log('TypeScript compilation passed.\n');

  console.log('[2/2] Running unit and integration tests...');
  execSync('npx vitest run', { stdio: 'inherit' });
  console.log('All tests passed.\n');

  console.log('--------------------------------');
  console.log('Quality check complete: All checks passed.');
  process.exit(0);
} catch {
  console.error('\n--------------------------------');
  console.error('Quality check failed: See errors above.');
  process.exit(1);
}
