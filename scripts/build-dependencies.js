#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔧 Building workspace dependencies...\n');

function runCommand(command, description) {
  console.log(`📋 ${description}`);
  console.log(`   Command: ${command}`);
  
  try {
    const startTime = Date.now();
    execSync(command, { 
      stdio: 'inherit',
      timeout: 300000 // 5 minute timeout
    });
    const duration = Date.now() - startTime;
    
    console.log(`   ✅ Success (${duration}ms)\n`);
    return true;
  } catch (error) {
    console.log(`   ❌ Failed: ${error.message}\n`);
    return false;
  }
}

function checkDistExists(packagePath, packageName) {
  const distPath = `${packagePath}/dist`;
  if (fs.existsSync(distPath)) {
    console.log(`   ✅ ${packageName} dist folder exists`);
    return true;
  } else {
    console.log(`   ❌ ${packageName} dist folder missing`);
    return false;
  }
}

// Build packages in dependency order
const buildOrder = [
  { path: 'packages/core', name: '@motiadev/core' },
  { path: 'packages/test', name: '@motiadev/test' },
  { path: 'packages/stream-client', name: '@motiadev/stream-client' },
  { path: 'packages/stream-client-browser', name: '@motiadev/stream-client-browser' },
  { path: 'packages/stream-client-node', name: '@motiadev/stream-client-node' },
  { path: 'packages/stream-client-react', name: '@motiadev/stream-client-react' },
  { path: 'packages/ui', name: '@motiadev/ui' },
  { path: 'packages/workbench', name: '@motiadev/workbench' }
];

console.log('Building packages in dependency order...\n');

let allSuccess = true;

for (const pkg of buildOrder) {
  console.log(`🏗️  Building ${pkg.name}...`);
  
  // Check if package exists
  if (!fs.existsSync(`${pkg.path}/package.json`)) {
    console.log(`   ⚠️  Package ${pkg.path} not found, skipping...\n`);
    continue;
  }
  
  // Build the package
  const success = runCommand(`cd ${pkg.path} && npm run build`, `Building ${pkg.name}`);
  
  if (success) {
    checkDistExists(pkg.path, pkg.name);
  } else {
    allSuccess = false;
    console.log(`   ⚠️  Build failed for ${pkg.name}, continuing...\n`);
  }
}

console.log('📊 Build Summary\n');

if (allSuccess) {
  console.log('🎉 All packages built successfully!');
  console.log('   You can now run integration tests.');
} else {
  console.log('⚠️  Some packages failed to build.');
  console.log('   Check the errors above and try building individually.');
}

console.log('\n📋 Next Steps:');
console.log('1. Run "npm run validate:complete" to verify everything works');
console.log('2. Run "npm run test" to run all tests');
console.log('3. If issues persist, try "npm run build:legacy"');