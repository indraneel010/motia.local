#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Perfect Setup Validation\n');

class PerfectSetupValidator {
  constructor() {
    this.issues = [];
    this.warnings = [];
    this.successes = [];
  }

  validateJSON(filePath, description) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      JSON.parse(content);
      this.successes.push(`✅ ${description}: Valid JSON`);
      return true;
    } catch (error) {
      this.issues.push(`❌ ${description}: ${error.message}`);
      return false;
    }
  }

  validateTypeScriptConfig() {
    console.log('📋 Validating TypeScript Configuration...\n');

    const configs = [
      { path: 'tsconfig.json', name: 'Root TypeScript Config' },
      { path: 'packages/core/tsconfig.json', name: 'Core Package Config' },
      { path: 'packages/test/tsconfig.json', name: 'Test Package Config' }
    ];

    configs.forEach(({ path: configPath, name }) => {
      if (this.validateJSON(configPath, name)) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        
        // Check for performance optimizations
        if (config.compilerOptions) {
          const opts = config.compilerOptions;
          
          if (opts.incremental) {
            this.successes.push(`✅ ${name}: Incremental compilation enabled`);
          }
          
          if (opts.composite) {
            this.successes.push(`✅ ${name}: Composite project enabled`);
          }
          
          if (opts.target === 'ES2022') {
            this.successes.push(`✅ ${name}: Modern ES2022 target`);
          }
          
          if (opts.moduleResolution === 'Bundler') {
            this.successes.push(`✅ ${name}: Optimized module resolution`);
          }
        }
        
        // Check for project references
        if (config.references && config.references.length > 0) {
          this.successes.push(`✅ ${name}: Project references configured`);
        }
      }
    });
  }

  validateTurboConfig() {
    console.log('\n🚀 Validating Turbo Configuration...\n');

    if (this.validateJSON('turbo.json', 'Turbo Configuration')) {
      const turbo = JSON.parse(fs.readFileSync('turbo.json', 'utf8'));
      
      if (turbo.tasks) {
        const requiredTasks = ['build', 'build:fast', 'test', 'lint', 'type-check'];
        requiredTasks.forEach(task => {
          if (turbo.tasks[task]) {
            this.successes.push(`✅ Turbo: Task "${task}" configured`);
          } else {
            this.warnings.push(`⚠️  Turbo: Missing task "${task}"`);
          }
        });

        // Check for performance optimizations
        if (turbo.globalDependencies) {
          this.successes.push(`✅ Turbo: Global dependencies configured`);
        }
        
        if (turbo.globalEnv) {
          this.successes.push(`✅ Turbo: Global environment variables configured`);
        }
      }
    }
  }

  validatePackageScripts() {
    console.log('\n📦 Validating Package Scripts...\n');

    const packages = [
      { path: 'package.json', name: 'Root Package' },
      { path: 'packages/core/package.json', name: 'Core Package' },
      { path: 'packages/test/package.json', name: 'Test Package' }
    ];

    packages.forEach(({ path: pkgPath, name }) => {
      if (fs.existsSync(pkgPath)) {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        
        if (pkg.scripts) {
          const requiredScripts = name === 'Root Package' 
            ? ['build', 'build:fast', 'build:parallel', 'type-check', 'perf:analyze', 'perf:benchmark']
            : ['build', 'build:fast', 'type-check'];
            
          requiredScripts.forEach(script => {
            if (pkg.scripts[script]) {
              this.successes.push(`✅ ${name}: Script "${script}" available`);
            } else {
              this.warnings.push(`⚠️  ${name}: Missing script "${script}"`);
            }
          });
        }
      }
    });
  }

  validateTestPackageStructure() {
    console.log('\n🧪 Validating Test Package Structure...\n');

    const testFiles = [
      'packages/test/src/core-types.ts',
      'packages/test/src/event-manager.ts',
      'packages/test/src/motia-tester.ts',
      'packages/test/src/helpers.ts',
      'packages/test/src/types.ts',
      'packages/test/src/tester.ts',
      'packages/test/index.ts'
    ];

    testFiles.forEach(file => {
      if (fs.existsSync(file)) {
        this.successes.push(`✅ Test Package: ${path.basename(file)} exists`);
        
        // Check for import issues
        const content = fs.readFileSync(file, 'utf8');
        if (content.includes("from '@motiadev/core'")) {
          this.warnings.push(`⚠️  ${file}: Still importing from @motiadev/core`);
        } else if (content.includes("from './core-types'")) {
          this.successes.push(`✅ ${file}: Using local types`);
        }
      } else {
        this.issues.push(`❌ Test Package: Missing ${file}`);
      }
    });
  }

  validatePerformanceScripts() {
    console.log('\n⚡ Validating Performance Scripts...\n');

    const perfScripts = [
      'scripts/performance-analyzer.js',
      'scripts/benchmark-builds.js',
      'scripts/validate-perfect-setup.js'
    ];

    perfScripts.forEach(script => {
      if (fs.existsSync(script)) {
        this.successes.push(`✅ Performance: ${path.basename(script)} available`);
      } else {
        this.issues.push(`❌ Performance: Missing ${script}`);
      }
    });
  }

  generateReport() {
    console.log('\n📊 VALIDATION REPORT\n');
    console.log('='.repeat(50));

    if (this.successes.length > 0) {
      console.log('\n🎉 SUCCESSES:');
      this.successes.forEach(success => console.log(`   ${success}`));
    }

    if (this.warnings.length > 0) {
      console.log('\n⚠️  WARNINGS:');
      this.warnings.forEach(warning => console.log(`   ${warning}`));
    }

    if (this.issues.length > 0) {
      console.log('\n❌ ISSUES:');
      this.issues.forEach(issue => console.log(`   ${issue}`));
    }

    console.log('\n' + '='.repeat(50));
    
    const total = this.successes.length + this.warnings.length + this.issues.length;
    const successRate = ((this.successes.length / total) * 100).toFixed(1);
    
    console.log(`\n📈 SUCCESS RATE: ${successRate}% (${this.successes.length}/${total})`);
    
    if (this.issues.length === 0) {
      console.log('\n🏆 PERFECT SETUP ACHIEVED!');
      console.log('\n🚀 Ready for high-performance development!');
      console.log('\n📋 Next Steps:');
      console.log('   1. npm install');
      console.log('   2. npm run build:fast');
      console.log('   3. npm run perf:benchmark');
      console.log('   4. npm run perf:analyze');
    } else {
      console.log('\n🔧 SETUP NEEDS ATTENTION');
      console.log('Please address the issues above before proceeding.');
    }

    return this.issues.length === 0;
  }

  run() {
    console.log('Starting perfect setup validation...\n');

    this.validateTypeScriptConfig();
    this.validateTurboConfig();
    this.validatePackageScripts();
    this.validateTestPackageStructure();
    this.validatePerformanceScripts();

    return this.generateReport();
  }
}

const validator = new PerfectSetupValidator();
const isPerfect = validator.run();
process.exit(isPerfect ? 0 : 1);