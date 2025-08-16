# Turbo Build Optimization

This document describes the Turborepo optimization implemented for the Motia monorepo to improve build performance through intelligent caching and parallel execution.

## What Changed

### 1. Added Turborepo
- **Dependency**: Added `turbo` as a dev dependency
- **Configuration**: Created `turbo.json` with optimized pipeline
- **Scripts**: Updated root scripts to use turbo while preserving legacy options

### 2. Build Pipeline Optimization
- **Parallel Execution**: Independent packages now build in parallel
- **Intelligent Caching**: Builds are cached based on file content hashes
- **Dependency Awareness**: Only rebuild packages when their dependencies change

### 3. Preserved Compatibility
- **Legacy Scripts**: All original scripts preserved with `:legacy` suffix
- **Same Outputs**: Build artifacts remain identical
- **Development Workflow**: Watch mode and hot reloading unchanged

## Performance Improvements

### Expected Build Time Reductions
- **Cold Builds**: 10-20% faster through parallelization
- **Warm Cache**: 80-95% faster (sub-5-second builds)
- **Incremental**: Only rebuild changed packages + dependents

### Cache Benefits
- **Local Cache**: Stored in `.turbo/cache` directory
- **Smart Invalidation**: Cache invalidated only when inputs change
- **Team Sharing**: Optional remote cache for team collaboration

## Usage

### Standard Commands (Now Optimized)
```bash
npm run build        # Uses turbo with caching
npm run test         # Uses turbo with caching  
npm run lint         # Uses turbo with caching
npm run dev          # Uses turbo for initial build, then normal dev
```

### Legacy Commands (Original Behavior)
```bash
npm run build:legacy # Original pnpm build
npm run test:legacy  # Original pnpm test
npm run lint:legacy  # Original pnpm lint
```

### Turbo-Specific Commands
```bash
npm run turbo:build:dry      # See what turbo would do
npm run turbo:build:verbose  # Verbose build output
npm run turbo:cache:clear    # Clear turbo cache
npm run turbo:cache:status   # Check cache status
npm run validate:turbo       # Validate turbo setup
```

## Cache Management

### Local Cache
- **Location**: `.turbo/cache/`
- **Automatic**: Cache managed automatically by turbo
- **Cleanup**: Use `npm run turbo:cache:clear` if needed

### Cache Keys
Cache invalidation is based on:
- Source file content hashes
- Package.json changes
- TypeScript config changes
- Build script changes

## Troubleshooting

### If Builds Seem Slow
1. Check cache status: `npm run turbo:cache:status`
2. Run dry-run to see execution plan: `npm run turbo:build:dry`
3. Use verbose mode for debugging: `npm run turbo:build:verbose`

### If Builds Fail
1. Try clearing cache: `npm run turbo:cache:clear`
2. Fall back to legacy: `npm run build:legacy`
3. Check turbo daemon: `turbo daemon status`

### If Tests Have Type Errors
1. Ensure Jest types are configured in tsconfig.json
2. Check that `@types/jest` is installed in relevant packages
3. Verify workspace dependencies are built: `npm run build`

### If Module Resolution Fails
1. Run complete validation: `npm run validate:complete`
2. Check workspace package builds: `npm run build`
3. Verify pnpm workspace configuration

### If Cache Issues Occur
1. Validate setup: `npm run validate:turbo`
2. Check `.turboignore` patterns
3. Verify `turbo.json` configuration

## Migration Notes

### For Developers
- **No Changes Required**: Existing workflows continue to work
- **Faster Builds**: Enjoy significantly faster incremental builds
- **Cache Awareness**: Understand that builds may complete instantly when cached

### For CI/CD
- **Same Commands**: Use existing `npm run build` commands
- **Cache Benefits**: Consider enabling remote cache for team sharing
- **Parallel Execution**: CI builds will be faster due to parallelization

## Technical Details

### Pipeline Configuration
The `turbo.json` defines task dependencies:
- `build` depends on `^build` (upstream packages)
- `test` depends on `build` (local build completion)
- `lint` runs independently (no dependencies)

### Input Patterns
Turbo tracks these files for cache invalidation:
- Source files: `src/**/*.{ts,tsx,js,jsx,py,rb}`
- Config files: `tsconfig*.json`, `package.json`
- Build scripts: `scripts/**/*`

### Output Patterns
Turbo caches these build outputs:
- TypeScript builds: `dist/**`
- Next.js builds: `.next/**` (excluding cache)
- All package-specific outputs

## Future Enhancements

### Remote Cache (Optional)
- **Team Sharing**: Share cache across team members
- **CI Integration**: Populate cache from CI builds
- **Performance**: Even faster builds for team

### Advanced Optimization
- **Selective Testing**: Only test affected packages
- **Incremental Type Checking**: Faster TypeScript compilation
- **Build Profiling**: Identify bottlenecks

## Validation

### Quick Validation
Run the basic validation script:
```bash
npm run validate:turbo
```

### Complete System Validation
Run the comprehensive validation script:
```bash
npm run validate:complete
```

This will check:
- Turbo configuration validity
- TypeScript configuration (Jest types, etc.)
- Build system functionality
- Cache performance
- Legacy compatibility
- Package structure and dependencies

### Fixed Issues
The optimization includes fixes for:
- ✅ Jest type definitions in TypeScript configurations
- ✅ Module resolution for workspace packages
- ✅ Integration test configuration
- ✅ Duplicate Jest dependencies
- ✅ Test task dependencies in turbo pipeline