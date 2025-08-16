# Design Document

## Overview

This design implements Turborepo to optimize the Motia monorepo build system through intelligent caching, parallel execution, and dependency-aware task orchestration. The solution will reduce build times from minutes to seconds for incremental builds while maintaining all existing functionality.

## Architecture

### Current State Analysis
- **12 packages** with individual TypeScript builds
- **Multiple build formats** per package (CommonJS, ESM, type declarations)
- **Sequential execution** via pnpm workspace commands
- **No caching** - every build starts from scratch
- **Duplicate tooling** across packages (TypeScript, Jest, ESLint)

### Target Architecture
- **Turborepo orchestration** with dependency-aware task scheduling
- **Intelligent caching** based on file hashes and dependency graphs
- **Parallel execution** of independent tasks
- **Shared remote cache** for team collaboration
- **Incremental builds** that only rebuild changed packages

## Components and Interfaces

### 1. Turbo Configuration (`turbo.json`)
```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"],
      "cache": true
    },
    "test": {
      "dependsOn": ["build"],
      "cache": true
    },
    "lint": {
      "cache": true
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

### 2. Package Dependency Graph
```
core → stream-client → stream-client-browser → stream-client-react → workbench
     → stream-client-node
     → ui → workbench
     → test
```

### 3. Task Pipeline Design
- **Build Tasks**: TypeScript compilation with outputs cached by content hash
- **Test Tasks**: Jest execution cached by source and test file changes
- **Lint Tasks**: ESLint execution cached by source file changes
- **Dev Tasks**: Watch mode tasks that bypass cache for live development

### 4. Cache Strategy
- **Local Cache**: `.turbo/cache` directory for individual developer builds
- **Remote Cache**: Optional shared cache for team collaboration
- **Cache Keys**: Generated from file content hashes + dependency versions
- **Cache Outputs**: Build artifacts, test results, lint results

## Data Models

### Build Artifact Structure
```
.turbo/
├── cache/           # Local build cache
├── logs/           # Task execution logs  
└── daemon.json     # Turbo daemon configuration

dist/               # Package build outputs (unchanged)
├── cjs/           # CommonJS builds
├── esm/           # ES Module builds
└── types/         # TypeScript declarations
```

### Task Configuration Schema
```typescript
interface TaskConfig {
  dependsOn: string[];     // Task dependencies
  outputs: string[];       // Cacheable output patterns
  cache: boolean;          // Enable caching
  persistent?: boolean;    // Long-running tasks
  env?: string[];         // Environment variables affecting cache
}
```

## Error Handling

### Cache Corruption
- **Detection**: Hash verification on cache retrieval
- **Recovery**: Automatic fallback to fresh build
- **Logging**: Clear error messages with recovery steps

### Build Failures
- **Isolation**: Failed builds don't affect independent packages
- **Dependency Handling**: Dependent builds are skipped with clear messaging
- **Retry Logic**: Automatic retry for transient failures

### Performance Degradation
- **Monitoring**: Build time tracking and reporting
- **Fallback**: Ability to disable turbo and use original pnpm commands
- **Debugging**: Verbose logging modes for troubleshooting

## Testing Strategy

### Unit Tests
- **Turbo Configuration**: Validate pipeline definitions
- **Cache Logic**: Test cache key generation and retrieval
- **Dependency Resolution**: Verify correct build order

### Integration Tests
- **Full Build Cycles**: Test complete build pipeline with caching
- **Incremental Builds**: Verify only changed packages rebuild
- **Cross-Package Dependencies**: Test dependency-aware rebuilds

### Performance Tests
- **Baseline Measurement**: Current build times without turbo
- **Cache Hit Performance**: Sub-5-second builds with warm cache
- **Cache Miss Performance**: Comparable or better than current builds
- **Parallel Execution**: Verify concurrent task execution

### Compatibility Tests
- **Existing Scripts**: All current npm scripts continue working
- **Output Verification**: Build artifacts remain identical
- **Development Workflow**: Watch mode and hot reloading unchanged

## Implementation Phases

### Phase 1: Basic Turbo Setup
- Install and configure Turborepo
- Define basic pipeline for build/test/lint tasks
- Migrate existing scripts to use turbo commands
- Verify output compatibility

### Phase 2: Cache Optimization
- Configure local caching with appropriate cache keys
- Optimize task dependencies and outputs
- Add cache debugging and monitoring
- Performance testing and tuning

### Phase 3: Advanced Features
- Remote cache configuration (optional)
- CI/CD integration for cache population
- Developer tooling and documentation
- Team onboarding and training

## Security Considerations

### Cache Security
- **Local Cache**: Stored in project directory, no sensitive data exposure
- **Remote Cache**: Optional feature with access controls
- **Cache Keys**: Based on file content, no secrets in cache keys

### Build Isolation
- **Sandboxed Execution**: Each package builds in isolation
- **Dependency Verification**: Ensure only declared dependencies are used
- **Output Validation**: Verify build outputs match expected patterns

## Performance Targets

### Build Time Improvements
- **Cold Builds**: 10-20% faster through parallelization
- **Warm Cache**: 80-95% faster (sub-5-second builds)
- **Incremental**: Only rebuild changed packages + dependents
- **CI/CD**: Significant speedup through cache reuse

### Resource Utilization
- **CPU**: Better utilization through parallel execution
- **Memory**: Efficient caching without excessive memory usage
- **Disk**: Reasonable cache size with automatic cleanup