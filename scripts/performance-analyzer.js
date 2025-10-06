#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Motia Performance Analyzer\n');

class PerformanceAnalyzer {
  constructor() {
    this.results = {
      buildTimes: {},
      bundleSizes: {},
      cacheHitRates: {},
      recommendations: []
    };
  }

  measureBuildTime(command, label) {
    console.log(`⏱️  Measuring ${label}...`);
    const start = Date.now();
    
    try {
      execSync(command, { stdio: 'pipe' });
      const duration = Date.now() - start;
      this.results.buildTimes[label] = duration;
      console.log(`   ✅ ${label}: ${duration}ms`);
      return duration;
    } catch (error) {
      console.log(`   ❌ ${label}: Failed`);
      return null;
    }
  }

  analyzeBundleSizes() {
    console.log('\n📦 Analyzing bundle sizes...');
    
    const packages = [
      'packages/core/dist',
      'packages/test/dist',
      'packages/ui/dist',
      'packages/workbench/dist'
    ];

    packages.forEach(pkg => {
      if (fs.existsSync(pkg)) {
        const size = this.getDirectorySize(pkg);
        const packageName = pkg.split('/')[1];
        this.results.bundleSizes[packageName] = size;
        console.log(`   📊 ${packageName}: ${this.formatBytes(size)}`);
      }
    });
  }

  getDirectorySize(dirPath) {
    let totalSize = 0;
    
    const files = fs.readdirSync(dirPath);
    files.forEach(file => {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        totalSize += this.getDirectorySize(filePath);
      } else {
        totalSize += stats.size;
      }
    });
    
    return totalSize;
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  analyzeCachePerformance() {
    console.log('\n🗄️  Analyzing cache performance...');
    
    try {
      // Clean build
      console.log('   🧹 Clean build...');
      execSync('npm run clean:dist', { stdio: 'pipe' });
      const cleanBuildTime = this.measureBuildTime('npm run build:fast', 'Clean Build');
      
      // Cached build
      console.log('   ⚡ Cached build...');
      const cachedBuildTime = this.measureBuildTime('npm run build:fast', 'Cached Build');
      
      if (cleanBuildTime && cachedBuildTime) {
        const improvement = ((cleanBuildTime - cachedBuildTime) / cleanBuildTime * 100).toFixed(1);
        console.log(`   📈 Cache improvement: ${improvement}%`);
        this.results.cacheHitRates.improvement = improvement;
      }
    } catch (error) {
      console.log('   ⚠️  Cache analysis failed');
    }
  }

  generateRecommendations() {
    console.log('\n💡 Performance Recommendations:\n');
    
    const recommendations = [];

    // Build time recommendations
    if (this.results.buildTimes['Clean Build'] > 30000) {
      recommendations.push({
        type: 'Build Performance',
        issue: 'Slow build times detected',
        solution: 'Consider enabling TypeScript incremental compilation and project references',
        impact: 'High'
      });
    }

    // Bundle size recommendations
    Object.entries(this.results.bundleSizes).forEach(([pkg, size]) => {
      if (size > 5 * 1024 * 1024) { // 5MB
        recommendations.push({
          type: 'Bundle Size',
          issue: `Large bundle detected in ${pkg}`,
          solution: 'Consider code splitting and tree shaking optimizations',
          impact: 'Medium'
        });
      }
    });

    // Cache recommendations
    if (this.results.cacheHitRates.improvement < 50) {
      recommendations.push({
        type: 'Cache Performance',
        issue: 'Low cache hit rate',
        solution: 'Optimize Turbo cache configuration and inputs',
        impact: 'High'
      });
    }

    // General recommendations
    recommendations.push(
      {
        type: 'Development Workflow',
        issue: 'Optimize development experience',
        solution: 'Use build:fast for development, full build for production',
        impact: 'Medium'
      },
      {
        type: 'Parallel Execution',
        issue: 'Maximize build parallelization',
        solution: 'Use --parallel flag for independent tasks',
        impact: 'Medium'
      },
      {
        type: 'Dependency Management',
        issue: 'Optimize package resolution',
        solution: 'Regular dependency auditing and deduplication',
        impact: 'Low'
      }
    );

    this.results.recommendations = recommendations;

    recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec.type} (${rec.impact} Impact)`);
      console.log(`   Issue: ${rec.issue}`);
      console.log(`   Solution: ${rec.solution}\n`);
    });
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalPackages: Object.keys(this.results.bundleSizes).length,
        totalBundleSize: Object.values(this.results.bundleSizes).reduce((a, b) => a + b, 0),
        buildPerformance: this.results.buildTimes,
        cacheEfficiency: this.results.cacheHitRates
      },
      details: this.results,
      nextSteps: [
        'Implement TypeScript project references',
        'Enable incremental compilation',
        'Optimize Turbo cache configuration',
        'Consider bundle splitting strategies',
        'Set up performance monitoring'
      ]
    };

    fs.writeFileSync('performance-report.json', JSON.stringify(report, null, 2));
    console.log('📊 Performance report saved to performance-report.json');
  }

  async run() {
    console.log('Starting comprehensive performance analysis...\n');

    // Measure build performance
    this.analyzeCachePerformance();
    
    // Analyze bundle sizes
    this.analyzeBundleSizes();
    
    // Generate recommendations
    this.generateRecommendations();
    
    // Generate report
    this.generateReport();

    console.log('\n🎉 Performance analysis complete!');
    console.log('\n📋 Quick Actions:');
    console.log('1. npm run build:fast     # Use optimized build');
    console.log('2. npm run build:parallel # Parallel execution');
    console.log('3. npm run type-check     # Separate type checking');
    console.log('4. npm run clean:cache    # Clear caches if needed');
  }
}

const analyzer = new PerformanceAnalyzer();
analyzer.run().catch(console.error);