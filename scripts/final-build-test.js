#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Final Build System Test\n');

let totalTests = 0;
let passedTests = 0;

function test(description, testFn) {
  totalTests++;
  console.log(`🧪 ${description}`);
  
  try {
    const result = testFn();
    if (result !== false) {
      console.log('   ✅ PASS');
      passedTests++;
    } else {
      console.log('   ❌ FAIL');
    }
  } catch (error) {
    console.log(`   ❌ FAIL: ${error.message}`);
  }
}

// Test 1: Configuration Files
test('Configuration files exist and are valid', () => {
  const files = ['package.json', 'turbo.json', 'pnpm-workspace.yaml'];
  
  for (const file of files) {
    if (!fs.existsSync(file)) {
      throw new Error(`Missing ${file}`);
    }
    
    if (file.endsWith('.json')) {
      try {
        JSON.parse(fs.readFileSync(file, 'utf8'));
      } catch (error) {
        throw new Error(`Invalid JSON in ${file}: ${error.message}`);
      }
    }
  }
  
  return true;
});

// Test 2: Package Structure
test('All required packages exist', () => {
  const packages = [
    'packages/core',
    'packages/stream-client',
    'packages/workbench',
    'packages/test',
    'packages/ui'
  ];
  
  for (const pkg of packages) {
    if (!fs.existsSync(pkg)) {
      throw new Error(`Missing package: ${pkg}`);
    }
    
    const packageJson = path.join(pkg, 'package.json');
    if (!fs.existsSync(packageJson)) {
      throw new Error(`Missing package.json in ${pkg}`);
    }
  }
  
  return true;
});

// Test 3: Turbo Configuration
test('Turbo configuration is valid', () => {
  const turboConfig = JSON.parse(fs.readFileSync('turbo.json', 'utf8'));
  
  if (!turboConfig.tasks) {
    throw new Error('Missing tasks in turbo.json');
  }
  
  const requiredTasks = ['build', 'test', 'lint'];
  for (const task of requiredTasks) {
    if (!turboConfig.tasks[task]) {
      throw new Error(`Missing task: ${task}`);
    }
  }
  
  return true;
});

// Test 4: Test Package Configuration
test('Test package is properly configured', () => {
  const testTsconfig = 'packages/test/tsconfig.json';
  const helpersFile = 'packages/test/src/helpers.ts';
  const typesFile = 'packages/test/src/types.ts';
  
  if (!fs.existsSync(testTsconfig)) {
    throw new Error('Missing test tsconfig.json');
  }
  
  if (!fs.existsSync(helpersFile)) {
    throw new Error('Missing helpers.ts');
  }
  
  if (!fs.existsSync(typesFile)) {
    throw new Error('Missing types.ts');
  }
  
  // Check that files don't have Jest namespace errors
  const helpersContent = fs.readFileSync(helpersFile, 'utf8');
  if (helpersContent.includes('jest.fn()') && !helpersContent.includes('MockFunction')) {
    throw new Error('helpers.ts still has Jest namespace issues');
  }
  
  return true;
});

// Test 5: Scripts Validation
test('Package.json scripts are valid', () => {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  const requiredScripts = [
    'build',
    'test', 
    'lint',
    'build:legacy',
    'test:legacy'
  ];
  
  for (const script of requiredScripts) {
    if (!pkg.scripts[script]) {
      throw new Error(`Missing script: ${script}`);
    }
  }
  
  // Check for duplicates by parsing the raw content
  const content = fs.readFileSync('package.json', 'utf8');
  const scriptMatches = content.match(/"([^"]+)":\s*"[^"]*"/g) || [];
  const keys = [];
  
  for (const match of scriptMatches) {
    const key = match.match(/"([^"]+)":/)[1];
    if (keys.includes(key)) {
      throw new Error(`Duplicate key found: ${key}`);
    }
    keys.push(key);
  }
  
  return true;
});

// Test 6: Dependencies Check
test('Required dependencies are present', () => {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  if (!pkg.devDependencies || !pkg.devDependencies.turbo) {
    throw new Error('Turbo dependency missing');
  }
  
  // Check test package dependencies
  const testPkg = JSON.parse(fs.readFileSync('packages/test/package.json', 'utf8'));
  
  if (!testPkg.devDependencies || !testPkg.devDependencies['@types/jest']) {
    throw new Error('Jest types missing from test package');
  }
  
  return true;
});

// Test 7: File Integrity
test('Critical files have correct content', () => {
  // Check turbo.json has correct structure
  const turboConfig = JSON.parse(fs.readFileSync('turbo.json', 'utf8'));
  
  if (turboConfig.tasks.build.dependsOn[0] !== '^build') {
    throw new Error('Build task dependency incorrect');
  }
  
  if (!turboConfig.tasks.build.cache) {
    throw new Error('Build caching not enabled');
  }
  
  // Check helpers.ts doesn't have Jest errors
  const helpersContent = fs.readFileSync('packages/test/src/helpers.ts', 'utf8');
  
  if (!helpersContent.includes('MockFunction')) {
    throw new Error('helpers.ts not properly updated');
  }
  
  return true;
});

// Summary
console.log('\n📊 Test Results Summary\n');
console.log(`Total Tests: ${totalTests}`);
console.log(`Passed: ${passedTests}`);
console.log(`Failed: ${totalTests - passedTests}`);

if (passedTests === totalTests) {
  console.log('\n🎉 All tests passed! Build system is ready.');
  console.log('\n📋 Next Steps:');
  console.log('1. Install dependencies: npm install');
  console.log('2. Test the build: npm run build');
  console.log('3. Run tests: npm run test');
  console.log('4. Check performance: npm run test:optimization');
  console.log('\n💡 Pro Tips:');
  console.log('- Use "npm run build:legacy" to compare with old build');
  console.log('- Use "npm run turbo:cache:status" to monitor cache');
  console.log('- Use "npm run turbo:build:dry" to see execution plan');
} else {
  console.log('\n❌ Some tests failed. Please review the errors above.');
  console.log('\n🔧 Troubleshooting:');
  console.log('- Check file paths and permissions');
  console.log('- Verify JSON syntax in configuration files');
  console.log('- Ensure all required packages are present');
}

process.exit(passedTests === totalTests ? 0 : 1);