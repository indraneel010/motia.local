#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Complete System Validation\n');

let totalIssues = 0;
const issues = [];

function checkFile(filePath, description) {
  console.log(`📁 Checking ${description}...`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`   ❌ ${filePath} missing`);
    issues.push(`Missing file: ${filePath}`);
    totalIssues++;
    return false;
  }
  
  try {
    if (filePath.endsWith('.json')) {
      JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
    console.log(`   ✅ ${filePath} valid`);
    return true;
  } catch (error) {
    console.log(`   ❌ ${filePath} invalid: ${error.message}`);
    issues.push(`Invalid file: ${filePath} - ${error.message}`);
    totalIssues++;
    return false;
  }
}

function checkPackageJson(packagePath, packageName) {
  console.log(`📦 Validating ${packageName} package.json...`);
  
  if (!fs.existsSync(packagePath)) {
    console.log(`   ❌ ${packagePath} missing`);
    issues.push(`Missing package: ${packagePath}`);
    totalIssues++;
    return;
  }
  
  try {
    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    // Check for duplicate keys by parsing again
    const content = fs.readFileSync(packagePath, 'utf8');
    const keys = [];
    const scriptMatches = content.match(/"([^"]+)":\s*"[^"]*"/g) || [];
    
    scriptMatches.forEach(match => {
      const key = match.match(/"([^"]+)":/)[1];
      if (keys.includes(key)) {
        console.log(`   ❌ Duplicate key found: ${key}`);
        issues.push(`Duplicate key in ${packagePath}: ${key}`);
        totalIssues++;
      } else {
        keys.push(key);
      }
    });
    
    if (totalIssues === 0) {
      console.log(`   ✅ ${packageName} package.json valid`);
    }
    
  } catch (error) {
    console.log(`   ❌ ${packagePath} invalid: ${error.message}`);
    issues.push(`Invalid package.json: ${packagePath} - ${error.message}`);
    totalIssues++;
  }
}

function checkTurboConfig() {
  console.log('🚀 Validating Turbo configuration...');
  
  const turboPath = 'turbo.json';
  if (!checkFile(turboPath, 'turbo.json')) return;
  
  try {
    const turboConfig = JSON.parse(fs.readFileSync(turboPath, 'utf8'));
    
    if (!turboConfig.tasks) {
      console.log('   ❌ Missing tasks configuration');
      issues.push('Turbo config missing tasks');
      totalIssues++;
      return;
    }
    
    const requiredTasks = ['build', 'test', 'lint'];
    requiredTasks.forEach(task => {
      if (!turboConfig.tasks[task]) {
        console.log(`   ❌ Missing task: ${task}`);
        issues.push(`Missing turbo task: ${task}`);
        totalIssues++;
      } else {
        console.log(`   ✅ Task ${task} configured`);
      }
    });
    
  } catch (error) {
    console.log(`   ❌ Turbo config error: ${error.message}`);
    issues.push(`Turbo config error: ${error.message}`);
    totalIssues++;
  }
}

function checkTestPackage() {
  console.log('🧪 Validating test package...');
  
  const testPackagePath = 'packages/test';
  const helpersPath = path.join(testPackagePath, 'src/helpers.ts');
  const typesPath = path.join(testPackagePath, 'src/types.ts');
  const tsconfigPath = path.join(testPackagePath, 'tsconfig.json');
  
  // Check if files exist
  [helpersPath, typesPath, tsconfigPath].forEach(filePath => {
    if (!fs.existsSync(filePath)) {
      console.log(`   ❌ Missing: ${filePath}`);
      issues.push(`Missing test file: ${filePath}`);
      totalIssues++;
    } else {
      console.log(`   ✅ Found: ${path.basename(filePath)}`);
    }
  });
  
  // Check tsconfig has Jest types
  if (fs.existsSync(tsconfigPath)) {
    try {
      const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
      if (tsconfig.compilerOptions && tsconfig.compilerOptions.types) {
        const hasJest = tsconfig.compilerOptions.types.includes('jest');
        if (hasJest) {
          console.log('   ✅ Jest types configured in tsconfig');
        } else {
          console.log('   ❌ Jest types missing from tsconfig');
          issues.push('Jest types not configured in test package tsconfig');
          totalIssues++;
        }
      }
    } catch (error) {
      console.log(`   ❌ Error reading tsconfig: ${error.message}`);
      issues.push(`Test tsconfig error: ${error.message}`);
      totalIssues++;
    }
  }
}

// Run all validations
console.log('🔍 Starting complete system validation...\n');

// Check core files
checkFile('package.json', 'root package.json');
checkFile('turbo.json', 'turbo configuration');
checkFile('pnpm-workspace.yaml', 'workspace configuration');

// Check package.json files for duplicates
checkPackageJson('package.json', 'root');

// Check turbo configuration
checkTurboConfig();

// Check test package specifically
checkTestPackage();

// Check key packages exist
const keyPackages = [
  'packages/core',
  'packages/stream-client', 
  'packages/workbench',
  'packages/test',
  'packages/ui'
];

keyPackages.forEach(pkg => {
  const packageJsonPath = path.join(pkg, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    console.log(`✅ Package ${pkg} exists`);
    checkPackageJson(packageJsonPath, pkg);
  } else {
    console.log(`❌ Package ${pkg} missing`);
    issues.push(`Missing package: ${pkg}`);
    totalIssues++;
  }
});

// Summary
console.log('\n📊 Validation Summary\n');

if (totalIssues === 0) {
  console.log('🎉 All validations passed! System is ready.');
  console.log('\nNext steps:');
  console.log('1. Run: npm install');
  console.log('2. Run: npm run build');
  console.log('3. Run: npm run test');
} else {
  console.log(`❌ Found ${totalIssues} issues:`);
  issues.forEach((issue, index) => {
    console.log(`   ${index + 1}. ${issue}`);
  });
  console.log('\nPlease fix these issues before proceeding.');
}

process.exit(totalIssues > 0 ? 1 : 0);