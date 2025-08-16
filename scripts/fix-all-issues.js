#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing all detected issues...\n');

function fixPackageJsonDuplicates() {
  console.log('📦 Fixing package.json duplicate keys...');
  
  const packagePath = 'package.json';
  if (!fs.existsSync(packagePath)) {
    console.log('   ❌ package.json not found');
    return;
  }
  
  try {
    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    // Clean up scripts - remove duplicates
    const cleanScripts = {};
    const scriptKeys = Object.keys(pkg.scripts || {});
    
    scriptKeys.forEach(key => {
      if (!cleanScripts[key]) {
        cleanScripts[key] = pkg.scripts[key];
      }
    });
    
    pkg.scripts = cleanScripts;
    
    // Write back with proper formatting
    fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2) + '\n');
    console.log('   ✅ Fixed package.json duplicates');
    
  } catch (error) {
    console.log(`   ❌ Error fixing package.json: ${error.message}`);
  }
}

function ensureTestPackageTypes() {
  console.log('🧪 Ensuring test package has proper Jest types...');
  
  const testTsconfigPath = 'packages/test/tsconfig.json';
  
  if (!fs.existsSync(testTsconfigPath)) {
    console.log('   ❌ Test tsconfig.json not found');
    return;
  }
  
  try {
    const tsconfig = JSON.parse(fs.readFileSync(testTsconfigPath, 'utf8'));
    
    // Ensure types array exists and includes jest
    if (!tsconfig.compilerOptions) {
      tsconfig.compilerOptions = {};
    }
    
    if (!tsconfig.compilerOptions.types) {
      tsconfig.compilerOptions.types = [];
    }
    
    if (!tsconfig.compilerOptions.types.includes('jest')) {
      tsconfig.compilerOptions.types.push('jest');
    }
    
    if (!tsconfig.compilerOptions.types.includes('node')) {
      tsconfig.compilerOptions.types.push('node');
    }
    
    // Write back
    fs.writeFileSync(testTsconfigPath, JSON.stringify(tsconfig, null, 2) + '\n');
    console.log('   ✅ Fixed test package Jest types');
    
  } catch (error) {
    console.log(`   ❌ Error fixing test tsconfig: ${error.message}`);
  }
}

function ensureJestTypeReferences() {
  console.log('🔧 Adding Jest type references to test files...');
  
  const testFiles = [
    'packages/test/src/helpers.ts',
    'packages/test/src/types.ts'
  ];
  
  testFiles.forEach(filePath => {
    if (!fs.existsSync(filePath)) {
      console.log(`   ⚠️  ${filePath} not found`);
      return;
    }
    
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Add Jest reference if not present
      if (!content.includes('/// <reference types="jest" />')) {
        content = '/// <reference types="jest" />\n' + content;
        fs.writeFileSync(filePath, content);
        console.log(`   ✅ Added Jest reference to ${path.basename(filePath)}`);
      } else {
        console.log(`   ✅ Jest reference already present in ${path.basename(filePath)}`);
      }
      
    } catch (error) {
      console.log(`   ❌ Error fixing ${filePath}: ${error.message}`);
    }
  });
}

function validateTurboConfig() {
  console.log('🚀 Validating Turbo configuration...');
  
  const turboPath = 'turbo.json';
  if (!fs.existsSync(turboPath)) {
    console.log('   ❌ turbo.json not found');
    return;
  }
  
  try {
    const turboConfig = JSON.parse(fs.readFileSync(turboPath, 'utf8'));
    
    // Ensure proper structure
    if (!turboConfig.tasks) {
      console.log('   ❌ Missing tasks in turbo.json');
      return;
    }
    
    // Check test task dependency
    if (turboConfig.tasks.test && turboConfig.tasks.test.dependsOn) {
      const deps = turboConfig.tasks.test.dependsOn;
      if (deps.includes('^build')) {
        // Fix: change ^build to build for test tasks
        turboConfig.tasks.test.dependsOn = deps.map(dep => dep === '^build' ? 'build' : dep);
        fs.writeFileSync(turboPath, JSON.stringify(turboConfig, null, 2) + '\n');
        console.log('   ✅ Fixed test task dependencies in turbo.json');
      } else {
        console.log('   ✅ Turbo test dependencies are correct');
      }
    }
    
  } catch (error) {
    console.log(`   ❌ Error validating turbo config: ${error.message}`);
  }
}

function createMissingDirectories() {
  console.log('📁 Ensuring required directories exist...');
  
  const requiredDirs = [
    'scripts',
    '.turbo',
    'packages/test/src'
  ];
  
  requiredDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`   ✅ Created directory: ${dir}`);
    } else {
      console.log(`   ✅ Directory exists: ${dir}`);
    }
  });
}

// Run all fixes
console.log('🔧 Starting comprehensive system fixes...\n');

createMissingDirectories();
fixPackageJsonDuplicates();
ensureTestPackageTypes();
ensureJestTypeReferences();
validateTurboConfig();

console.log('\n🎉 All fixes completed!');
console.log('\nNext steps:');
console.log('1. Run: npm run validate:complete');
console.log('2. If validation passes, run: npm install');
console.log('3. Then run: npm run build');