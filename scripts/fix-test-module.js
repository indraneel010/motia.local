#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔧 Fixing @motiadev/test module resolution...\n');

function runCommand(command, description) {
  console.log(`📋 ${description}`);
  
  try {
    execSync(command, { 
      stdio: 'inherit',
      timeout: 120000 // 2 minute timeout
    });
    console.log(`   ✅ Success\n`);
    return true;
  } catch (error) {
    console.log(`   ❌ Failed: ${error.message}\n`);
    return false;
  }
}

// Step 1: Build the test package specifically
console.log('🏗️  Step 1: Building @motiadev/test package...');
const testBuildSuccess = runCommand('cd packages/test && npm run build', 'Building test package');

if (testBuildSuccess) {
  // Check if dist was created
  if (fs.existsSync('packages/test/dist')) {
    console.log('   ✅ Test package dist folder created');
    
    // List contents
    try {
      const distContents = fs.readdirSync('packages/test/dist');
      console.log(`   📁 Dist contents: ${distContents.join(', ')}`);
    } catch (error) {
      console.log(`   ⚠️  Could not read dist contents: ${error.message}`);
    }
  } else {
    console.log('   ❌ Test package dist folder not created');
  }
} else {
  console.log('   ❌ Test package build failed');
}

// Step 2: Build core package (dependency of test)
console.log('🏗️  Step 2: Building @motiadev/core package...');
const coreBuildSuccess = runCommand('cd packages/core && npm run build', 'Building core package');

// Step 3: Install/link workspace dependencies
console.log('🔗 Step 3: Linking workspace dependencies...');
const linkSuccess = runCommand('npm install', 'Installing and linking dependencies');

// Step 4: Verify the module can be resolved
console.log('🔍 Step 4: Verifying module resolution...');

try {
  // Try to resolve the module path
  const testPackagePath = 'packages/test/dist/index.js';
  if (fs.existsSync(testPackagePath)) {
    console.log('   ✅ @motiadev/test module file exists');
  } else {
    console.log('   ❌ @motiadev/test module file missing');
    console.log(`   Expected: ${testPackagePath}`);
  }
  
  // Check playground node_modules
  const playgroundNodeModules = 'playground/node_modules/@motiadev/test';
  if (fs.existsSync(playgroundNodeModules)) {
    console.log('   ✅ @motiadev/test linked in playground node_modules');
  } else {
    console.log('   ❌ @motiadev/test not linked in playground node_modules');
  }
  
} catch (error) {
  console.log(`   ❌ Error checking module resolution: ${error.message}`);
}

console.log('📊 Fix Summary\n');

if (testBuildSuccess && coreBuildSuccess && linkSuccess) {
  console.log('🎉 Module resolution should now work!');
  console.log('   Try running your integration tests again.');
} else {
  console.log('⚠️  Some steps failed. Manual intervention may be needed.');
}

console.log('\n📋 Manual Steps if Issues Persist:');
console.log('1. cd packages/test && npm run build');
console.log('2. cd packages/core && npm run build'); 
console.log('3. npm install (from root)');
console.log('4. Check that packages/test/dist/index.js exists');
console.log('5. Try running: npm run build (uses turbo to build all)');