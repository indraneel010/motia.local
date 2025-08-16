#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Validating Turbo build optimization...\n');

// Test 1: Verify turbo.json exists and is valid
console.log('1. Checking turbo.json configuration...');
try {
    const turboConfig = JSON.parse(fs.readFileSync('turbo.json', 'utf8'));
    console.log('   ✅ turbo.json is valid JSON');

    if (turboConfig.pipeline && turboConfig.pipeline.build) {
        console.log('   ✅ Build pipeline configured');
    } else {
        console.log('   ❌ Build pipeline missing');
    }

    if (turboConfig.pipeline && turboConfig.pipeline.test) {
        console.log('   ✅ Test pipeline configured');
    } else {
        console.log('   ❌ Test pipeline missing');
    }
} catch (error) {
    console.log('   ❌ turbo.json is invalid:', error.message);
}

// Test 2: Verify package.json has turbo dependency
console.log('\n2. Checking turbo dependency...');
try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    if (packageJson.devDependencies && packageJson.devDependencies.turbo) {
        console.log('   ✅ Turbo dependency found');
    } else {
        console.log('   ❌ Turbo dependency missing');
    }
} catch (error) {
    console.log('   ❌ Error reading package.json:', error.message);
}

// Test 3: Check if legacy scripts are preserved
console.log('\n3. Checking legacy script preservation...');
try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const scripts = packageJson.scripts || {};

    if (scripts['build:legacy']) {
        console.log('   ✅ Legacy build script preserved');
    } else {
        console.log('   ⚠️  Legacy build script not found');
    }

    if (scripts['test:legacy']) {
        console.log('   ✅ Legacy test script preserved');
    } else {
        console.log('   ⚠️  Legacy test script not found');
    }
} catch (error) {
    console.log('   ❌ Error checking scripts:', error.message);
}

// Test 4: Verify workspace packages exist
console.log('\n4. Checking workspace packages...');
const expectedPackages = [
    'packages/core',
    'packages/stream-client',
    'packages/workbench',
    'packages/ui'
];

expectedPackages.forEach(pkg => {
    if (fs.existsSync(pkg)) {
        console.log(`   ✅ ${pkg} exists`);
    } else {
        console.log(`   ❌ ${pkg} missing`);
    }
});

console.log('\n🎉 Validation complete!');
console.log('\nNext steps:');
console.log('1. Run "npm install" to install turbo');
console.log('2. Run "npm run build" to test turbo build');
console.log('3. Run "npm run turbo:build:dry" to see what turbo would do');
console.log('4. Run "npm run turbo:cache:status" to check cache status');