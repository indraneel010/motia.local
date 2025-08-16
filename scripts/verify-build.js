#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔍 Verifying Complete Build System\n');

let errors = [];
let warnings = [];

function runCommand(command, description) {
  console.log(`🔧 ${description}...`);
  try {
    execSync(command, { stdio: 'pipe', timeout: 60000 });
    console.log('   ✅ Success');
    return true;
  } catch (error) {
    console.log(`   ❌ Failed: ${error.message}`);
    errors.push(`${description}: ${error.message}`);
    return false;
  }
}

function checkTypeScript() {
  console.log('📝 Checking TypeScript compilation...\n');
  
  const packages = [
    'packages/test',
    'packages/core',
    'packages/stream-client',
    'packages/workbench'
  ];
  
  packages.forEach(pkg => {
    const tsconfigPath = `${pkg}/tsconfig.json`;
    if (fs.existsSync(tsconfigPath)) {
      console.log(`   Checking ${pkg}...`);
      try {
        execSync(`npx tsc --noEmit --project ${tsconfigPath}`, { 
          stdio: 'pipe',
          timeout: 30000 
        });
        console.log(`   ✅ ${pkg} compiles successfully`);
      } catch (error) {
        console.log(`   ❌ ${pkg} has TypeScript errors`);
        errors.push(`TypeScript errors in ${pkg}`);
      }
    }
  });
}

function validateConfiguration() {
  console.log('\n📋 Validating configuration files...\n');
  
  const configs = [
    { file: 'package.json', desc: 'Root package.json' },
    { file: 'turbo.json', desc: 'Turbo configuration' },
    { file: 'packages/test/package.json', desc: 'Test package.json' },
    { file: 'packages/test/tsconfig.json', desc: 'Test tsconfig.json' }
  ];
  
  configs.forEach(({ file, desc }) => {
    console.log(`   Checking ${desc}...`);
    if (!fs.existsSync(file)) {
      errors.push(`Missing file: ${file}`);
      console.log(`   ❌ Missing: ${file}`);
      return;
    }
    
    try {
      if (file.endsWith('.json')) {
        JSON.parse(fs.readFileSync(file, 'utf8'));
      }
      console.log(`   ✅ ${desc} is valid`);
    } catch (error) {
      errors.push(`Invalid ${desc}: ${error.message}`);
      console.log(`   ❌ Invalid: ${error.message}`);
    }
  });
}

function checkDependencies() {
  console.log('\n📦 Checking dependencies...\n');
  
  // Check test package dependencies
  const testPkg = JSON.parse(fs.readFileSync('packages/test/package.json', 'utf8'));
  
  const requiredDeps = ['@motiadev/core', 'supertest'];
  const requiredDevDeps = ['@types/node', '@types/jest', 'typescript'];
  
  requiredDeps.forEach(dep => {
    if (testPkg.dependencies && testPkg.dependencies[dep]) {
      console.log(`   ✅ ${dep} found in dependencies`);
    } else {
      warnings.push(`Missing dependency: ${dep}`);
      console.log(`   ⚠️  Missing dependency: ${dep}`);
    }
  });
  
  requiredDevDeps.forEach(dep => {
    if (testPkg.devDependencies && testPkg.devDependencies[dep]) {
      console.log(`   ✅ ${dep} found in devDependencies`);
    } else {
      warnings.push(`Missing devDependency: ${dep}`);
      console.log(`   ⚠️  Missing devDependency: ${dep}`);
    }
  });
}

// Run all checks
validateConfiguration();
checkDependencies();
checkTypeScript();

// Summary
console.log('\n📊 Build Verification Results\n');

if (errors.length === 0 && warnings.length === 0) {
  console.log('🎉 Perfect! All checks passed.');
  console.log('\n✅ Build System Status: FULLY OPERATIONAL');
  console.log('\n🚀 Ready for:');
  console.log('   - npm install');
  console.log('   - npm run build');
  console.log('   - npm run test');
  
} else {
  if (errors.length > 0) {
    console.log(`❌ Critical Errors (${errors.length}):`);
    errors.forEach((error, i) => console.log(`   ${i + 1}. ${error}`));
  }
  
  if (warnings.length > 0) {
    console.log(`\n⚠️  Warnings (${warnings.length}):`);
    warnings.forEach((warning, i) => console.log(`   ${i + 1}. ${warning}`));
  }
  
  if (errors.length === 0) {
    console.log('\n✅ Build System Status: OPERATIONAL (with warnings)');
  } else {
    console.log('\n❌ Build System Status: NEEDS ATTENTION');
  }
}

process.exit(errors.length > 0 ? 1 : 0);