#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Testing Turbo Build Optimization Integration\n');

function runCommand(command, description) {
  console.log(`📋 ${description}`);
  console.log(`   Command: ${command}`);
  
  try {
    const startTime = Date.now();
    const output = execSync(command, { 
      encoding: 'utf8', 
      stdio: 'pipe',
      timeout: 300000 // 5 minute timeout
    });
    const duration = Date.now() - startTime;
    
    console.log(`   ✅ Success (${duration}ms)`);
    return { success: true, duration, output };
  } catch (error) {
    console.log(`   ❌ Failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

function checkFileExists(filePath, description) {
  console.log(`📁 ${description}`);
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ ${filePath} exists`);
    return true;
  } else {
    console.log(`   ❌ ${filePath} missing`);
    return false;
  }
}

function compareDirectories(dir1, dir2, description) {
  console.log(`🔍 ${description}`);
  
  if (!fs.existsSync(dir1) || !fs.existsSync(dir2)) {
    console.log(`   ⚠️  One or both directories don't exist`);
    return false;
  }
  
  // Simple comparison - check if both have files
  const files1 = fs.readdirSync(dir1, { recursive: true });
  const files2 = fs.readdirSync(dir2, { recursive: true });
  
  if (files1.length > 0 && files2.length > 0) {
    console.log(`   ✅ Both directories have build outputs`);
    return true;
  } else {
    console.log(`   ❌ Build output mismatch`);
    return false;
  }
}

async function runTests() {
  const results = {
    configValidation: [],
    buildTests: [],
    performanceTests: []
  };

  // Phase 1: Configuration Validation
  console.log('🔧 Phase 1: Configuration Validation\n');
  
  results.configValidation.push(
    checkFileExists('turbo.json', 'Checking turbo.json exists')
  );
  
  results.configValidation.push(
    checkFileExists('package.json', 'Checking package.json exists')
  );
  
  results.configValidation.push(
    checkFileExists('.turboignore', 'Checking .turboignore exists')
  );

  // Check turbo.json validity
  try {
    const turboConfig = JSON.parse(fs.readFileSync('turbo.json', 'utf8'));
    console.log('📋 Validating turbo.json structure');
    
    if (turboConfig.tasks && turboConfig.tasks.build) {
      console.log('   ✅ Build task configured');
      results.configValidation.push(true);
    } else {
      console.log('   ❌ Build task missing');
      results.configValidation.push(false);
    }
  } catch (error) {
    console.log('📋 Validating turbo.json structure');
    console.log(`   ❌ Invalid JSON: ${error.message}`);
    results.configValidation.push(false);
  }

  // Phase 2: Build Tests
  console.log('\n🏗️  Phase 2: Build System Tests\n');
  
  // Test 1: Clean build with turbo
  const cleanResult = runCommand('npm run clean', 'Clean workspace');
  results.buildTests.push(cleanResult.success);
  
  // Test 2: First build (cold cache)
  const firstBuild = runCommand('npm run build', 'First build (cold cache)');
  results.buildTests.push(firstBuild.success);
  
  if (firstBuild.success) {
    // Test 3: Check build outputs exist
    const outputCheck = checkFileExists('packages/core/dist', 'Checking core build output');
    results.buildTests.push(outputCheck);
    
    // Test 4: Second build (warm cache)
    const secondBuild = runCommand('npm run build', 'Second build (warm cache)');
    results.buildTests.push(secondBuild.success);
    
    // Test 5: Legacy build comparison
    runCommand('npm run clean', 'Clean for legacy test');
    const legacyBuild = runCommand('npm run build:legacy', 'Legacy build test');
    results.buildTests.push(legacyBuild.success);
  }

  // Phase 3: Performance Analysis
  console.log('\n⚡ Phase 3: Performance Analysis\n');
  
  if (firstBuild.success && firstBuild.duration) {
    console.log(`📊 Cold build time: ${firstBuild.duration}ms`);
    
    if (secondBuild && secondBuild.success && secondBuild.duration) {
      console.log(`📊 Warm build time: ${secondBuild.duration}ms`);
      
      const improvement = ((firstBuild.duration - secondBuild.duration) / firstBuild.duration) * 100;
      console.log(`📊 Cache improvement: ${improvement.toFixed(1)}%`);
      
      results.performanceTests.push(improvement > 0);
    }
  }

  // Summary
  console.log('\n📈 Test Summary\n');
  
  const configPassed = results.configValidation.filter(Boolean).length;
  const buildPassed = results.buildTests.filter(Boolean).length;
  const perfPassed = results.performanceTests.filter(Boolean).length;
  
  console.log(`Configuration Tests: ${configPassed}/${results.configValidation.length} passed`);
  console.log(`Build Tests: ${buildPassed}/${results.buildTests.length} passed`);
  console.log(`Performance Tests: ${perfPassed}/${results.performanceTests.length} passed`);
  
  const totalPassed = configPassed + buildPassed + perfPassed;
  const totalTests = results.configValidation.length + results.buildTests.length + results.performanceTests.length;
  
  console.log(`\n🎯 Overall: ${totalPassed}/${totalTests} tests passed`);
  
  if (totalPassed === totalTests) {
    console.log('\n🎉 All tests passed! Turbo optimization is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Check the output above for details.');
  }
  
  return totalPassed === totalTests;
}

// Run the tests
runTests().catch(console.error);