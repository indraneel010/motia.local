#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

console.log('⚡ Build Performance Benchmark\n');

class BuildBenchmark {
  constructor() {
    this.results = [];
  }

  benchmark(command, label, iterations = 3) {
    console.log(`🏃 Benchmarking ${label}...`);
    const times = [];

    for (let i = 0; i < iterations; i++) {
      // Clean before each run for consistency
      try {
        execSync('npm run clean:dist', { stdio: 'pipe' });
      } catch (e) {
        // Ignore clean errors
      }

      const start = process.hrtime.bigint();
      
      try {
        execSync(command, { stdio: 'pipe' });
        const end = process.hrtime.bigint();
        const duration = Number(end - start) / 1000000; // Convert to milliseconds
        times.push(duration);
        console.log(`   Run ${i + 1}: ${duration.toFixed(0)}ms`);
      } catch (error) {
        console.log(`   Run ${i + 1}: Failed`);
        return null;
      }
    }

    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    const min = Math.min(...times);
    const max = Math.max(...times);

    const result = {
      label,
      command,
      iterations,
      times,
      average: avg,
      min,
      max,
      stdDev: this.calculateStdDev(times, avg)
    };

    this.results.push(result);
    console.log(`   📊 Average: ${avg.toFixed(0)}ms (min: ${min.toFixed(0)}ms, max: ${max.toFixed(0)}ms)\n`);
    
    return result;
  }

  calculateStdDev(values, mean) {
    const squareDiffs = values.map(value => Math.pow(value - mean, 2));
    const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / values.length;
    return Math.sqrt(avgSquareDiff);
  }

  compareBuilds() {
    console.log('📈 Build Comparison:\n');

    // Sort by average time
    const sorted = [...this.results].sort((a, b) => a.average - b.average);

    sorted.forEach((result, index) => {
      const fastest = sorted[0];
      const improvement = index === 0 ? 0 : ((result.average - fastest.average) / fastest.average * 100);
      
      console.log(`${index + 1}. ${result.label}`);
      console.log(`   Time: ${result.average.toFixed(0)}ms`);
      if (improvement > 0) {
        console.log(`   ${improvement.toFixed(1)}% slower than fastest`);
      } else {
        console.log(`   🏆 Fastest build`);
      }
      console.log(`   Consistency: ±${result.stdDev.toFixed(0)}ms\n`);
    });
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      system: {
        node: process.version,
        platform: process.platform,
        arch: process.arch
      },
      results: this.results,
      summary: {
        fastestBuild: this.results.reduce((prev, current) => 
          prev.average < current.average ? prev : current
        ),
        recommendations: this.generateRecommendations()
      }
    };

    fs.writeFileSync('benchmark-report.json', JSON.stringify(report, null, 2));
    console.log('📊 Benchmark report saved to benchmark-report.json');
  }

  generateRecommendations() {
    const fastest = this.results.reduce((prev, current) => 
      prev.average < current.average ? prev : current
    );

    return [
      `Use "${fastest.command}" for optimal build performance`,
      'Consider using build:fast for development workflows',
      'Enable Turbo remote caching for team environments',
      'Monitor build times regularly with this benchmark script'
    ];
  }

  async run() {
    console.log('Starting build performance benchmark...\n');

    // Benchmark different build strategies
    const benchmarks = [
      { command: 'npm run build:fast', label: 'Fast Build (Optimized)' },
      { command: 'npm run build', label: 'Standard Build' },
      { command: 'npm run build:parallel', label: 'Parallel Build' },
      { command: 'npm run build:legacy', label: 'Legacy Build (pnpm)' }
    ];

    for (const { command, label } of benchmarks) {
      try {
        await this.benchmark(command, label, 2); // Reduced iterations for speed
      } catch (error) {
        console.log(`⚠️  Skipping ${label}: ${error.message}\n`);
      }
    }

    if (this.results.length > 0) {
      this.compareBuilds();
      this.generateReport();

      console.log('🎯 Recommendations:');
      const recommendations = this.generateRecommendations();
      recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec}`);
      });
    } else {
      console.log('❌ No successful benchmarks completed');
    }

    console.log('\n✅ Benchmark complete!');
  }
}

const benchmark = new BuildBenchmark();
benchmark.run().catch(console.error);