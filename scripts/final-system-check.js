#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Final System Compatibility Check\n');

let issues = [];
let warnings = [];

function checkFile(filePath, description) {
  console.log(`📁 ${description}...`);
  
  if (!fs.existsSync(filePath)) {
    issues.push(`Missing: ${filePath}`);
    console.log(`   ❌ Missing: ${filePath}`);
    return false;
  }
  
  console.log(`   ✅ Found: ${filePath}`);
  return true;
}

function validateJSON(filePath, description) {
  console.log(`📋 Validating ${description}...`);
  
  if (!fs.existsSync(filePath)) {
    issues.push(`Missing JSON file: ${filePath}`);
    console.log(`   ❌ Missing: ${filePath}`);
    return false;
  }
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    JSON.parse(content);
    
    // Check for duplicate keys
    const lines = content.split('\n');
    const keys = new Set();
    let hasDuplicates = false;
    
    lines.forEach((line, index) => {
      const match = line.match(/^\s*"([^"]+)"\s*:/);
      if (match) {
        const key = match[1];
        if (keys.has(key)) {
          issues.push(`Duplicate key "${key}" in ${filePath} at line ${index + 1}`);
          hasDuplicates = true;
        }
        keys.add(key);
      }
    });
    
    if (hasDuplicates) {
      console.log(`   ❌ Has duplicate keys`);
      return false;
    } else {
      console.log(`   ✅ Valid JSON, no duplicates`);
      return true;
    }
    
  } catch (error) {
    issues.push(`Invalid JSON in ${filePath}: ${error.message}`);
    console.log(`   ❌ Invalid JSON: ${error.message}`);
    return false;
  }
}

function checkTypeScriptFile(filePath, description) {
  console.log(`📝 Checking ${description}...`);
  
  if (!fs.existsSync(filePath)) {
    issues.push(`Missing TypeScript file: ${filePath}`);
    console.log(`   ❌ Missing: ${filePath}`);
    return false;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Check for common issues
  const commonIssues = [
    { pattern: /jest\.fn\(\)/, message: 'Direct jest.fn() usage (should use MockFunction)' },
    { pattern: /jest\.Mock(?!Function)/, message: 'Direct jest.Mock usage' },
    { pattern: /Cannot find module/, message: 'Module resolution error' },
    { pattern: /Cannot find name 'jest'/, message: 'Jest types not available' }
  ];
  
  let hasIssues = false;
  commonIssues.forEach(({ pattern, message }) => {
    if (pattern.test(content)) {
      warnings.push(`${filePath}: ${message}`);
      hasIssues = true;
    }
  });
  
  if (hasIssues) {
    console.log(`   ⚠️  Has potential issues`);
  } else {
    console.log(`   ✅ Looks good`);
  }
  
  return !hasIssues;
}

function checkPackageStructure() {
  console.log('📦 Checking package structure...\n');
  
  const packages = [
    'packages/core',
    'packages/stream-client',
    'packages/workbench',
    'packages/test',
    'packages/ui'
  ];
  
  packages.forEach(pkg => {
    const packageJsonPath = path.join(pkg, 'package.json');
    const exists = checkFile(packageJsonPath, `${pkg} package.json`);
    
    if (exists) {
      validateJSON(packageJsonPath, `${pkg} package.json`);
    }
  });
}

function checkTurboSetup() {
  console.log('\n🚀 Checking Turbo setup...\n');
  
  // Check turbo.json
  if (validateJSON('turbo.json', 'Turbo configuration')) {
    const turboConfig = JSON.parse(fs.readFileSync('turbo.json', 'utf8'));
    
    if (!turboConfig.tasks) {
      issues.push('turbo.json missing tasks configuration');
      console.log('   ❌ Missing tasks configuration');
    } else {
      const requiredTasks = ['build', 'test', 'lint'];
      requiredTasks.forEach(task => {
        if (turboConfig.tasks[task]) {
          console.log(`   ✅ Task "${task}" configured`);
        } else {
          issues.push(`Missing turbo task: ${task}`);
          console.log(`   ❌ Missing task: ${task}`);
        }
      });
    }
  }
  
  // Check root package.json for turbo dependency
  if (fs.existsSync('package.json')) {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    if (pkg.devDependencies && pkg.devDependencies.turbo) {
      console.log('   ✅ Turbo dependency found');
    } else {
      issues.push('Turbo dependency missing from root package.json');
      console.log('   ❌ Turbo dependency missing');
    }
  }
}

function checkTestPackage() {
  console.log('\n🧪 Checking test package...\n');
  
  const testFiles = [
    'packages/test/tsconfig.json',
    'packages/test/src/helpers.ts',
    'packages/test/src/types.ts',
    'packages/test/src/tester.ts',
    'packages/test/src/event-manager.ts'
  ];
  
  testFiles.forEach(file => {
    if (file.endsWith('.json')) {
      validateJSON(file, path.basename(file));
    } else {
      checkTypeScriptFile(file, path.basename(file));
    }
  });
  
  // Check test package tsconfig specifically
  if (fs.existsSync('packages/test/tsconfig.json')) {
    const tsconfig = JSON.parse(fs.readFileSync('packages/test/tsconfig.json', 'utf8'));
    
    if (tsconfig.compilerOptions && tsconfig.compilerOptions.types) {
      const hasNode = tsconfig.compilerOptions.types.includes('node');
      const hasJest = tsconfig.compilerOptions.types.includes('jest');
      
      if (hasNode && hasJest) {
        console.log('   ✅ Node and Jest types configured');
      } else {
        warnings.push('Test tsconfig missing node or jest types');
        console.log('   ⚠️  Missing node or jest types');
      }
    }
  }
}

function checkBuildCompatibility() {
  console.log('\n🔧 Checking build compatibility...\n');
  
  // Check that all packages have build scripts
  const packages = ['packages/core', 'packages/stream-client', 'packages/workbench', 'packages/test', 'packages/ui'];
  
  packages.forEach(pkg => {
    const packageJsonPath = path.join(pkg, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      if (packageJson.scripts && packageJson.scripts.build) {
        console.log(`   ✅ ${pkg} has build script`);
      } else {
        warnings.push(`${pkg} missing build script`);
        console.log(`   ⚠️  ${pkg} missing build script`);
      }
    }
  });
  
  // Check root scripts
  if (fs.existsSync('package.json')) {
    const rootPkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const requiredScripts = ['build', 'test', 'lint', 'build:legacy'];
    
    requiredScripts.forEach(script => {
      if (rootPkg.scripts && rootPkg.scripts[script]) {
        console.log(`   ✅ Root has "${script}" script`);
      } else {
        issues.push(`Root package.json missing "${script}" script`);
        console.log(`   ❌ Root missing "${script}" script`);
      }
    });
  }
}

// Run all checks
console.log('🔍 Starting comprehensive system check...\n');

// Core files
validateJSON('package.json', 'Root package.json');
checkFile('pnpm-workspace.yaml', 'Workspace configuration');
checkFile('.turboignore', 'Turbo ignore file');

// Package structure
checkPackageStructure();

// Turbo setup
checkTurboSetup();

// Test package
checkTestPackage();

// Build compatibility
checkBuildCompatibility();

// Summary
console.log('\n📊 Final Results\n');

if (issues.length === 0 && warnings.length === 0) {
  console.log('🎉 Perfect! All checks passed with no issues or warnings.');
  console.log('\n✅ System Status: READY FOR PRODUCTION');
  console.log('\n📋 Next Steps:');
  console.log('1. npm install');
  console.log('2. npm run build');
  console.log('3. npm run test');
  console.log('4. npm run test:optimization');
  
} else {
  if (issues.length > 0) {
    console.log(`❌ Found ${issues.length} critical issues:`);
    issues.forEach((issue, index) => {
      console.log(`   ${index + 1}. ${issue}`);
    });
  }
  
  if (warnings.length > 0) {
    console.log(`\n⚠️  Found ${warnings.length} warnings:`);
    warnings.forEach((warning, index) => {
      console.log(`   ${index + 1}. ${warning}`);
    });
  }
  
  if (issues.length === 0) {
    console.log('\n✅ System Status: READY (with minor warnings)');
    console.log('The warnings above are non-critical and the system should work fine.');
  } else {
    console.log('\n❌ System Status: NEEDS FIXES');
    console.log('Please address the critical issues above before proceeding.');
  }
}

console.log('\n🔧 Available Commands:');
console.log('- npm run build          # Optimized build');
console.log('- npm run build:legacy   # Original build');
console.log('- npm run test           # Run tests');
console.log('- npm run lint           # Run linting');
console.log('- npm run turbo:cache:status  # Check cache');

process.exit(issues.length > 0 ? 1 : 0);